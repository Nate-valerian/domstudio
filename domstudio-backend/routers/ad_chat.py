"""AdPilot AI chat router."""

from __future__ import annotations

import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_utils import decode_token
from database import PlanName, Subscription, User, get_db


router = APIRouter()
optional_bearer = HTTPBearer(auto_error=False)

CHAT_GUEST_DAILY_LIMIT = int(os.getenv("ADPILOT_CHAT_GUEST_DAILY_LIMIT", os.getenv("ADPILOT_CHAT_DAILY_LIMIT", "10")))
CHAT_FREE_USER_DAILY_LIMIT = int(os.getenv("ADPILOT_CHAT_FREE_USER_DAILY_LIMIT", "30"))
CHAT_PAID_USER_DAILY_LIMIT = int(os.getenv("ADPILOT_CHAT_PAID_USER_DAILY_LIMIT", "150"))
CHAT_MAX_MESSAGES = int(os.getenv("ADPILOT_CHAT_MAX_MESSAGES", "10"))
CHAT_MAX_TOKENS = int(os.getenv("ADPILOT_CHAT_MAX_TOKENS", os.getenv("TEXT_AI_MAX_TOKENS", "900")))
CHAT_TIMEOUT_MS = int(os.getenv("TEXT_AI_TIMEOUT_MS", "60000"))
_chat_hits: dict[str, list[datetime]] = defaultdict(list)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)


class AdChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=CHAT_MAX_MESSAGES)
    product: str | None = Field(default="", max_length=200)
    language: Literal["ru", "en"] = "ru"


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _chat_limit_for_tier(tier: str) -> int:
    if tier == "paid":
        return _env_int("ADPILOT_CHAT_PAID_USER_DAILY_LIMIT", CHAT_PAID_USER_DAILY_LIMIT)
    if tier == "free":
        return _env_int("ADPILOT_CHAT_FREE_USER_DAILY_LIMIT", CHAT_FREE_USER_DAILY_LIMIT)
    return _env_int("ADPILOT_CHAT_GUEST_DAILY_LIMIT", CHAT_GUEST_DAILY_LIMIT)


def _check_chat_rate(key: str, limit: int) -> int:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    _chat_hits[key] = [hit for hit in _chat_hits[key] if hit > cutoff]
    if len(_chat_hits[key]) >= limit:
        return -1
    _chat_hits[key].append(now)
    return limit - len(_chat_hits[key])


async def _chat_identity(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
    db: AsyncSession,
) -> tuple[str, str, int]:
    ip = request.client.host if request.client else "unknown"
    if credentials is None:
        tier = "guest"
        return f"guest:{ip}", tier, _chat_limit_for_tier(tier)

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")

    sub = await db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    plan = sub.plan if sub else PlanName.free
    tier = "free" if plan == PlanName.free else "paid"
    return f"user:{user.id}", tier, _chat_limit_for_tier(tier)


def _text_ai_settings() -> tuple[str, str, str, int, int]:
    base_url = os.getenv("TEXT_AI_BASE_URL", "").rstrip("/")
    api_key = os.getenv("TEXT_AI_API_KEY", "")
    model = os.getenv("TEXT_AI_MODEL", "")
    timeout_ms = int(os.getenv("TEXT_AI_TIMEOUT_MS", str(CHAT_TIMEOUT_MS)))
    max_tokens = int(os.getenv("ADPILOT_CHAT_MAX_TOKENS", str(CHAT_MAX_TOKENS)))
    return base_url, api_key, model, timeout_ms, max_tokens


def _system_prompt(language: str, product: str) -> str:
    lang_line = (
        "Answer in Russian unless the user asks for another language."
        if language == "ru"
        else "Answer in English unless the user asks for another language."
    )
    product_line = f"Current product/context: {product.strip()}" if product and product.strip() else "No product context was provided yet."
    service_map = (
        "DomStudio capabilities you may mention when genuinely useful: "
        "Studio creates AI product photos from an uploaded image or text prompt; "
        "it supports marketplace/product modes, lifestyle, catalog, creative, fitting, stories, and video previews; "
        "marketplace presets help format visuals for WB, Ozon, Avito, Yandex, Stories, banners, and social posts; "
        "Quick Tools include background removal, collage, watermark, promo badge, image resizing, compression, and checks; "
        "AdPilot AI writes and improves product cards, Avito listings, social posts, Yandex ads, product descriptions, buyer replies, review replies, landing copy, and similar business copy; "
        "users can send generated images from Studio or Tools into AdPilot for matching text; "
        "members get higher AdPilot AI chat limits than guests, and paid members get the highest limit; "
        "for site problems, billing, careers, or partnership requests, users can use the Contact page."
    )
    return (
        "You are AdPilot AI inside DomStudio. Help small business owners improve ads, marketplace listings, "
        "social posts, buyer replies, and content ideas. Be practical, concrete, and ready-to-use. "
        f"{service_map} "
        "Occasionally suggest a DomStudio feature only when it solves the user's current need. "
        "Do not over-promote DomStudio, do not claim capabilities outside this list, and do not promise human support inside the chat. "
        "If the user is vague, ask one focused question or give a short starter version with clear assumptions. "
        "Do not invent prices, discounts, guarantees, availability, addresses, legal claims, or medical results. "
        "Keep replies compact enough for a chat UI, but include copy examples when useful. "
        f"{lang_line} {product_line}"
    )


async def ask_text_ai(req: AdChatRequest) -> tuple[str, str | None]:
    base_url, api_key, model, timeout_ms, max_tokens = _text_ai_settings()
    if not base_url or not model:
        raise HTTPException(503, "AdPilot AI is not configured.")

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    messages = [{"role": "system", "content": _system_prompt(req.language, req.product or "")}]
    messages.extend({"role": item.role, "content": item.content.strip()} for item in req.messages[-CHAT_MAX_MESSAGES:])

    async with httpx.AsyncClient(timeout=max(timeout_ms / 1000, 20)) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "temperature": 0.65,
                "max_tokens": max(128, min(max_tokens, 1500)),
                "messages": messages,
            },
        )

    if not response.is_success:
        raise HTTPException(502, f"AdPilot AI failed with {response.status_code}: {response.text[:300]}")

    data = response.json()
    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not reply:
        raise HTTPException(502, "AdPilot AI returned an empty reply.")
    return reply, None


@router.post("")
async def adpilot_chat(
    req: AdChatRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: AsyncSession = Depends(get_db),
):
    rate_key, tier, limit = await _chat_identity(request, credentials, db)
    remaining = _check_chat_rate(rate_key, limit)
    if remaining < 0:
        raise HTTPException(429, "Daily AdPilot AI chat limit reached.")

    reply, warning = await ask_text_ai(req)
    return {
        "reply": reply,
        "provider": "text-ai",
        "warning": warning,
        "remaining_free": remaining,
        "limit": limit,
        "tier": tier,
    }
