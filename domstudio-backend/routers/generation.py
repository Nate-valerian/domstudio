"""Authenticated proxy for the GPU generation worker."""

import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from database import TokenBalance, User, get_db
from dependencies import get_current_user
from services.comfy_client import generate_image_with_comfy


router = APIRouter()
GENERATION_API_URL = os.getenv("GENERATION_API_URL", "http://localhost:8001").rstrip("/")
GENERATION_PROVIDER = os.getenv("GENERATION_PROVIDER", "worker").lower()
GENERATION_TOKEN_COST = 100


class GenerateRequest(BaseModel):
    mode: str = "catalog"
    subject: str = Field(min_length=1, max_length=500)
    image: str | None = None
    style_hint: str = Field(default="", max_length=500)
    seed: int = -1
    upscale_4k: bool = False


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


@router.post("/generate")
async def generate(
    req: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    balance = await change_balance(
        db,
        current_user.id,
        -GENERATION_TOKEN_COST,
        require_balance=True,
    )
    if balance is None:
        raise HTTPException(402, "Insufficient tokens")

    try:
        if GENERATION_PROVIDER == "comfy":
            result = await generate_image_with_comfy(req)
        else:
            async with httpx.AsyncClient(timeout=600) as client:
                response = await client.post(
                    f"{GENERATION_API_URL}/generate",
                    json=req.model_dump(),
                )
                response.raise_for_status()
                result = response.json()

        if result.get("status") != "success":
            raise RuntimeError(result.get("error") or "Generation worker failed")
    except Exception as exc:
        await change_balance(db, current_user.id, GENERATION_TOKEN_COST)
        raise HTTPException(502, f"Generation failed: {exc}") from exc

    return {
        **result,
        "tokens_charged": GENERATION_TOKEN_COST,
        "token_balance": balance,
    }
