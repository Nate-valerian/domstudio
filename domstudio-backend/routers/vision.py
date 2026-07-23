"""Groq-powered product image analysis for AdPilot."""

from __future__ import annotations

import base64
import binascii
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Literal

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator


router = APIRouter()

DEFAULT_GROQ_VISION_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_GROQ_VISION_MODEL = "qwen/qwen3.6-27b"
DEFAULT_VISION_DAILY_LIMIT = 20
DEFAULT_VISION_MAX_IMAGE_BYTES = 8 * 1024 * 1024
_vision_hits: dict[str, list[datetime]] = defaultdict(list)


class VisionAnalyzeRequest(BaseModel):
    image_data: str = Field(min_length=32, max_length=14_500_000)
    language: Literal["ru", "en"] = "ru"
    product_context: str = Field(default="", max_length=1000)

    @field_validator("image_data")
    @classmethod
    def validate_image_data(cls, value: str) -> str:
        if not value.startswith(("data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64,")):
            raise ValueError("Use a base64 JPG, PNG, or WebP data URL")
        return value


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def vision_settings() -> tuple[str, str, str, int, int, int]:
    return (
        os.getenv("GROQ_VISION_BASE_URL", DEFAULT_GROQ_VISION_BASE_URL).rstrip("/"),
        os.getenv("GROQ_API_KEY", ""),
        os.getenv("GROQ_VISION_MODEL", DEFAULT_GROQ_VISION_MODEL),
        _env_int("GROQ_VISION_TIMEOUT_MS", 60000),
        _env_int("GROQ_VISION_MAX_TOKENS", 500),
        _env_int("GROQ_VISION_DAILY_LIMIT", DEFAULT_VISION_DAILY_LIMIT),
    )


def _decoded_image_size(image_data: str) -> int:
    try:
        encoded = image_data.split(",", 1)[1]
        return len(base64.b64decode(encoded, validate=True))
    except (IndexError, binascii.Error, ValueError) as exc:
        raise HTTPException(400, "Invalid base64 image data") from exc


def _check_vision_rate(ip: str, limit: int) -> int:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    _vision_hits[ip] = [hit for hit in _vision_hits[ip] if hit > cutoff]
    if len(_vision_hits[ip]) >= limit:
        return -1
    _vision_hits[ip].append(now)
    return limit - len(_vision_hits[ip])


def _vision_prompt(language: str, product_context: str) -> str:
    language_line = "Write the brief in Russian." if language == "ru" else "Write the brief in English."
    context_line = (
        f"Seller-provided context: {product_context.strip()}"
        if product_context.strip()
        else "The seller did not provide additional context."
    )
    return (
        "Analyze this product photo for an online seller. Return a compact factual product brief that another AI can use "
        "to write a marketplace listing or advertisement. Include only details that are visible or reasonably certain: "
        "product type, color, material or finish when visible, shape, components, packaging, visible brand and readable text, "
        "distinctive features, likely use, and photo quality issues that may affect a listing. Clearly mark uncertainty. "
        "Do not invent specifications, price, size, ingredients, certification, performance, warranty, or medical claims. "
        "Use short labeled lines, no markdown table, and stay under 180 words. "
        f"{language_line} {context_line}"
    )


def _clean_analysis(value: str) -> str:
    analysis = value.strip()
    if "<think>" in analysis:
        if "</think>" not in analysis:
            raise HTTPException(502, "Groq vision returned unfinished reasoning.")
        analysis = analysis.rsplit("</think>", 1)[1].strip()
    if analysis.startswith("```") and analysis.endswith("```"):
        analysis = analysis[3:-3].strip()
    return analysis[:4000].strip()


async def analyze_with_groq(req: VisionAnalyzeRequest) -> tuple[str, str]:
    base_url, api_key, model, timeout_ms, max_tokens, _ = vision_settings()
    if not api_key:
        raise HTTPException(503, "Groq vision is not configured. Add GROQ_API_KEY to the backend environment.")

    async with httpx.AsyncClient(timeout=max(timeout_ms / 1000, 20)) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "reasoning_effort": "none",
                "reasoning_format": "hidden",
                "temperature": 0.15,
                "max_completion_tokens": max(128, min(max_tokens, 900)),
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": _vision_prompt(req.language, req.product_context)},
                            {"type": "image_url", "image_url": {"url": req.image_data}},
                        ],
                    }
                ],
            },
        )

    if not response.is_success:
        raise HTTPException(502, f"Groq vision request failed with status {response.status_code}.")

    data = response.json()
    analysis = _clean_analysis(data.get("choices", [{}])[0].get("message", {}).get("content", ""))
    if not analysis:
        raise HTTPException(502, "Groq vision returned an empty analysis.")
    return analysis, model


@router.get("/health")
async def vision_health():
    _, api_key, model, _, _, limit = vision_settings()
    return {
        "ok": bool(api_key),
        "configured": bool(api_key),
        "provider": "groq",
        "model": model,
        "daily_limit_per_ip": limit,
    }


@router.post("/analyze")
async def analyze_product_image(req: VisionAnalyzeRequest, request: Request):
    _, api_key, _, _, _, limit = vision_settings()
    if not api_key:
        raise HTTPException(503, "Groq vision is not configured. Add GROQ_API_KEY to the backend environment.")

    max_bytes = _env_int("GROQ_VISION_MAX_IMAGE_BYTES", DEFAULT_VISION_MAX_IMAGE_BYTES)
    if _decoded_image_size(req.image_data) > max_bytes:
        raise HTTPException(413, "Image is too large for vision analysis.")

    ip = request.client.host if request.client else "unknown"
    remaining = _check_vision_rate(ip, limit)
    if remaining < 0:
        raise HTTPException(429, "Daily free image-analysis limit reached.")

    analysis, model = await analyze_with_groq(req)
    return {
        "analysis": analysis,
        "provider": "groq",
        "model": model,
        "remaining_free": remaining,
    }
