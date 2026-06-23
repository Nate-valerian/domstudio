"""DomStudio — sales-copy generation router."""

from __future__ import annotations

import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from database import GenerationJob, JobStatus, TokenBalance, User, get_db
from dependencies import get_current_user
from services.content_tools import (
    FIELD_LABELS,
    TOOL_BY_SLUG,
    build_prompt,
    clean_mapping,
    fallback_output,
    normalize_language,
    public_tools,
)


router = APIRouter()

TEXT_AI_BASE_URL = os.getenv("TEXT_AI_BASE_URL", "").rstrip("/")
TEXT_AI_API_KEY = os.getenv("TEXT_AI_API_KEY", "")
TEXT_AI_MODEL = os.getenv("TEXT_AI_MODEL", "")
TEXT_AI_TIMEOUT_MS = int(os.getenv("TEXT_AI_TIMEOUT_MS", "60000"))
TEXT_AI_TIMEOUT_SECONDS = max(TEXT_AI_TIMEOUT_MS / 1000, 60)
CONTENT_TOKEN_UNIT = int(os.getenv("CONTENT_TOKEN_UNIT", "10"))


class ContentGenerateRequest(BaseModel):
    tool_slug: str = Field(min_length=1, max_length=80)
    input: dict[str, str] = Field(default_factory=dict)
    profile: dict[str, str] = Field(default_factory=dict)
    output_language: str | None = Field(default="auto", max_length=20)


async def change_balance(db: AsyncSession, user_id, amount: int, require_balance: bool = False):
    conditions = [TokenBalance.user_id == user_id]
    if require_balance:
        conditions.append(TokenBalance.balance >= -amount)

    result = await db.execute(
        update(TokenBalance)
        .where(*conditions)
        .values(balance=TokenBalance.balance + amount)
        .returning(TokenBalance.balance)
    )
    return result.scalar_one_or_none()


def token_cost_for_tool(tool_slug: str) -> int:
    tool = TOOL_BY_SLUG.get(tool_slug)
    if not tool:
        raise HTTPException(400, "Unknown content tool")
    return tool.cost_units * CONTENT_TOKEN_UNIT


@router.get("/tools")
async def list_tools():
    return {
        "tools": public_tools(),
        "field_labels": FIELD_LABELS,
        "token_unit": CONTENT_TOKEN_UNIT,
    }


async def generate_with_text_backend(prompt: str) -> tuple[str, str | None]:
    if not TEXT_AI_BASE_URL or not TEXT_AI_MODEL:
        return "", "TEXT_AI_BASE_URL or TEXT_AI_MODEL is not configured."

    headers = {"Content-Type": "application/json"}
    if TEXT_AI_API_KEY:
        headers["Authorization"] = f"Bearer {TEXT_AI_API_KEY}"

    async with httpx.AsyncClient(timeout=TEXT_AI_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{TEXT_AI_BASE_URL}/chat/completions",
            headers=headers,
            json={
                "model": TEXT_AI_MODEL,
                "temperature": 0.7,
                "max_tokens": 1200,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an expert SMB marketing operator. "
                            "Write practical, specific, ready-to-use sales copy in the requested language. "
                            "Do not invent prices, warranty, availability, addresses, or discounts."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
            },
        )
        if not response.is_success:
            detail = response.text[:500]
            return "", f"Text AI backend failed with {response.status_code}: {detail}"
        data = response.json()

    output = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not output:
        return "", "Text AI backend returned an empty response."
    return output, None


@router.post("/generate")
async def generate_content(
    req: ContentGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tool = TOOL_BY_SLUG.get(req.tool_slug)
    if not tool:
        raise HTTPException(400, "Unknown content tool")

    input_data = clean_mapping(req.input)
    profile = clean_mapping(req.profile)
    output_language = normalize_language(req.output_language, input_data, profile)
    token_cost = token_cost_for_tool(tool.slug)
    balance = await change_balance(db, current_user.id, -token_cost, require_balance=True)
    if balance is None:
        raise HTTPException(402, "Insufficient tokens")

    prompt = build_prompt(tool, input_data, profile, output_language)
    output = fallback_output(tool.slug, input_data, profile, output_language)
    provider = "local-template"
    warning = None
    tokens_charged = token_cost

    try:
        ai_output, warning = await generate_with_text_backend(prompt)
        if ai_output:
            output = ai_output
            provider = "text-ai"
    except Exception as exc:
        warning = f"Text AI backend request failed. Used local template fallback: {exc}"

    if provider == "local-template":
        refunded_balance = await change_balance(db, current_user.id, token_cost)
        if refunded_balance is not None:
            balance = refunded_balance
        tokens_charged = 0
        detail = f" {warning}" if warning else ""
        warning = f"AI text backend unavailable, local template shown. No tokens charged.{detail}"

    job = GenerationJob(
        user_id=current_user.id,
        mode=f"content:{tool.slug}",
        subject=input_data.get("product") or input_data.get("customerQuestion") or tool.name,
        status=JobStatus.done,
        output_data=output,
        output_format="text",
        tokens_used=tokens_charged,
    )
    db.add(job)
    await db.flush()

    return {
        "status": "success",
        "tool": {
            "slug": tool.slug,
            "name": tool.name,
            "category": tool.category,
        },
        "output": output,
        "provider": provider,
        "output_language": output_language,
        "warning": warning,
        "tokens_charged": tokens_charged,
        "token_balance": balance,
        "job_id": str(job.id),
    }
