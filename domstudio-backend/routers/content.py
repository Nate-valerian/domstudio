"""DomStudio — sales-copy generation router."""

from __future__ import annotations

import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from database import GenerationJob, JobStatus, TokenBalance, User, get_db
from dependencies import get_current_user

ANON_DAILY_LIMIT = int(os.getenv("ANON_ADPILOT_LIMIT", "10"))
_anon_hits: dict[str, list[datetime]] = defaultdict(list)

def _check_anon_rate(ip: str) -> int:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    _anon_hits[ip] = [t for t in _anon_hits[ip] if t > cutoff]
    if len(_anon_hits[ip]) >= ANON_DAILY_LIMIT:
        return 0
    _anon_hits[ip].append(now)
    return ANON_DAILY_LIMIT - len(_anon_hits[ip])
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
TEXT_AI_MAX_TOKENS = int(os.getenv("TEXT_AI_MAX_TOKENS", "1200"))
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


@router.post("/generate/public")
async def generate_content_public(req: ContentGenerateRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    remaining = _check_anon_rate(ip)
    if remaining < 0:
        raise HTTPException(429, "Daily free limit reached. Register for unlimited access.")

    tool = TOOL_BY_SLUG.get(req.tool_slug)
    if not tool:
        raise HTTPException(400, "Unknown content tool")

    input_data = clean_mapping(req.input)
    profile = clean_mapping(req.profile)
    output_language = normalize_language(req.output_language, input_data, profile)
    prompt = build_prompt(tool, input_data, profile, output_language)
    output = fallback_output(tool.slug, input_data, profile, output_language)
    provider = "local-template"
    warning = None

    try:
        ai_output, warning = await generate_with_text_backend(prompt)
        if ai_output:
            output = ai_output
            provider = "text-ai"
    except Exception as exc:
        warning = f"AI unavailable: {exc}"

    return {
        "output": output,
        "provider": provider,
        "warning": warning,
        "tokens_charged": 0,
        "balance": None,
        "remaining_free": remaining,
    }


async def generate_with_text_backend(prompt: str) -> tuple[str, str | None]:
    base_url = os.getenv("TEXT_AI_BASE_URL", TEXT_AI_BASE_URL).rstrip("/")
    api_key = os.getenv("TEXT_AI_API_KEY", TEXT_AI_API_KEY)
    model = os.getenv("TEXT_AI_MODEL", TEXT_AI_MODEL)
    timeout_ms = int(os.getenv("TEXT_AI_TIMEOUT_MS", str(TEXT_AI_TIMEOUT_MS)))
    timeout_seconds = max(timeout_ms / 1000, 60)
    max_tokens = int(os.getenv("TEXT_AI_MAX_TOKENS", str(TEXT_AI_MAX_TOKENS)))

    if not base_url or not model:
        return "", "TEXT_AI_BASE_URL or TEXT_AI_MODEL is not configured."

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "temperature": 0.7,
                "max_tokens": max(64, min(max_tokens, 1200)),
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an expert SMB marketing operator. "
                            "Write practical, specific, ready-to-use sales copy in the requested language. "
                            "Use honest buyer psychology: connect the offer to the customer's pain, desire, relief, status, comfort, time saved, or confidence gained. "
                            "Make the copy feel human and concrete, not generic AI filler. "
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


@router.get("/text-ai/health")
async def text_ai_health():
    base_url = os.getenv("TEXT_AI_BASE_URL", TEXT_AI_BASE_URL).rstrip("/")
    model = os.getenv("TEXT_AI_MODEL", TEXT_AI_MODEL)
    api_key = os.getenv("TEXT_AI_API_KEY", TEXT_AI_API_KEY)
    if not base_url or not model:
        return {"ok": False, "configured": False, "error": "TEXT_AI_BASE_URL or TEXT_AI_MODEL is not configured."}

    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            health_urls = [f"{base_url}/health"]
            if base_url.endswith("/v1"):
                health_urls.append(f"{base_url[:-3]}/health")
            response = None
            for url in health_urls:
                response = await client.get(url, headers=headers)
                if response.is_success:
                    break
            if response.is_success:
                payload = response.json()
                return {
                    "ok": bool(payload.get("ok")),
                    "configured": True,
                    "model": model,
                    "backend": payload,
                }
            return {
                "ok": False,
                "configured": True,
                "model": model,
                "error": f"Health check failed with {response.status_code}: {response.text[:300]}",
            }
    except Exception as exc:
        return {"ok": False, "configured": True, "model": model, "error": str(exc)}


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
