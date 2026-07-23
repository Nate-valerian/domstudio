"""Shared OpenAI-compatible text provider chain for AdPilot."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx


logger = logging.getLogger(__name__)

DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_GROQ_MODEL = "qwen/qwen3.6-27b"
DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash"
DEFAULT_PROVIDER_TIMEOUT_MS = 20000


@dataclass(frozen=True)
class TextProvider:
    name: str
    base_url: str
    api_key: str
    model: str


def _provider_name(base_url: str, fallback: str = "text-ai") -> str:
    host = (urlparse(base_url).hostname or "").lower()
    if "groq.com" in host:
        return "groq"
    if "deepseek.com" in host:
        return "deepseek"
    return fallback


def _append_provider(providers: list[TextProvider], provider: TextProvider | None) -> None:
    if not provider or not provider.base_url or not provider.model:
        return
    fingerprint = (provider.base_url.rstrip("/").lower(), provider.model.lower())
    if any((item.base_url.rstrip("/").lower(), item.model.lower()) == fingerprint for item in providers):
        return
    providers.append(provider)


def configured_text_providers() -> list[TextProvider]:
    """Return Groq, DeepSeek, and optional custom text providers in configured order."""
    candidates: dict[str, TextProvider] = {}
    primary_base_url = os.getenv("TEXT_AI_BASE_URL", "").rstrip("/")
    primary_model = os.getenv("TEXT_AI_MODEL", "")
    primary_key = os.getenv("TEXT_AI_API_KEY", "")
    primary_name = _provider_name(primary_base_url) if primary_base_url else "text-ai"

    groq_key = (primary_key if primary_name == "groq" else "") or os.getenv("GROQ_API_KEY", "")
    if groq_key:
        groq_base_url = (
            (primary_base_url if primary_name == "groq" else "")
            or os.getenv("GROQ_TEXT_BASE_URL")
            or os.getenv("GROQ_VISION_BASE_URL")
            or DEFAULT_GROQ_BASE_URL
        ).rstrip("/")
        groq_model = (
            (primary_model if primary_name == "groq" else "")
            or os.getenv("GROQ_TEXT_MODEL")
            or os.getenv("GROQ_VISION_MODEL")
            or DEFAULT_GROQ_MODEL
        )
        candidates["groq"] = TextProvider("groq", groq_base_url, groq_key, groq_model)

    deepseek_key = os.getenv("DEEPSEEK_API_KEY", "") or (primary_key if primary_name == "deepseek" else "")
    if deepseek_key:
        deepseek_base_url = (
            os.getenv("DEEPSEEK_BASE_URL")
            or (primary_base_url if primary_name == "deepseek" else "")
            or DEFAULT_DEEPSEEK_BASE_URL
        ).rstrip("/")
        if deepseek_base_url.endswith("/v1"):
            deepseek_base_url = deepseek_base_url[:-3]
        deepseek_model = os.getenv("DEEPSEEK_MODEL") or DEFAULT_DEEPSEEK_MODEL
        candidates["deepseek"] = TextProvider(
            "deepseek", deepseek_base_url, deepseek_key, deepseek_model
        )

    if primary_base_url and primary_model and primary_name == "text-ai":
        candidates["text-ai"] = TextProvider("text-ai", primary_base_url, primary_key, primary_model)

    requested_order = [
        name.strip().lower()
        for name in os.getenv("TEXT_AI_PROVIDER_ORDER", "groq,deepseek,text-ai").split(",")
        if name.strip()
    ]
    providers: list[TextProvider] = []
    for name in [*requested_order, "groq", "deepseek", "text-ai"]:
        _append_provider(providers, candidates.get(name))
    return providers


def _request_payload(
    provider: TextProvider,
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
) -> dict:
    payload = {
        "model": provider.model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if provider.name == "deepseek" and provider.model.startswith("deepseek-v4"):
        payload["thinking"] = {"type": "disabled"}
    return payload


async def complete_with_fallback(
    messages: list[dict[str, str]],
    *,
    temperature: float,
    max_tokens: int,
    timeout_ms: int,
) -> tuple[str, str | None, str | None]:
    """Try each configured provider and report which one produced the output."""
    providers = configured_text_providers()
    if not providers:
        return "", None, "No text AI provider is configured."

    failed: list[str] = []
    try:
        provider_timeout_ms = int(os.getenv("TEXT_AI_PROVIDER_TIMEOUT_MS", str(DEFAULT_PROVIDER_TIMEOUT_MS)))
    except (TypeError, ValueError):
        provider_timeout_ms = DEFAULT_PROVIDER_TIMEOUT_MS
    provider_timeout_seconds = max(5, min(timeout_ms, provider_timeout_ms) / 1000)
    for provider in providers:
        headers = {"Content-Type": "application/json"}
        if provider.api_key:
            headers["Authorization"] = f"Bearer {provider.api_key}"
        try:
            async with httpx.AsyncClient(timeout=provider_timeout_seconds) as client:
                response = await client.post(
                    f"{provider.base_url}/chat/completions",
                    headers=headers,
                    json=_request_payload(provider, messages, temperature, max_tokens),
                )
            if not response.is_success:
                failed.append(f"{provider.name} HTTP {response.status_code}")
                continue
            output = response.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if not output:
                failed.append(f"{provider.name} empty response")
                continue
            warning = None
            if failed:
                warning = f"{', '.join(failed)}; {provider.name} fallback used."
            return output, provider.name, warning
        except Exception as exc:
            failed.append(f"{provider.name} request failed")
            logger.warning("Text provider %s failed: %s", provider.name, exc)

    return "", None, f"All configured text AI providers failed ({', '.join(failed)})."


async def text_provider_health() -> dict:
    """Probe the configured provider chain without exposing credentials."""
    providers = configured_text_providers()
    if not providers:
        return {
            "ok": False,
            "configured": False,
            "provider_order": [],
            "error": "No text AI provider is configured.",
        }

    checks = []
    for provider in providers:
        headers = {"Authorization": f"Bearer {provider.api_key}"} if provider.api_key else {}
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{provider.base_url}/models", headers=headers)
            checks.append(
                {
                    "provider": provider.name,
                    "model": provider.model,
                    "ok": response.is_success,
                    "status": response.status_code,
                }
            )
        except Exception as exc:
            logger.warning("Text provider health check failed for %s: %s", provider.name, exc)
            checks.append({"provider": provider.name, "model": provider.model, "ok": False, "error": "request failed"})

    return {
        "ok": any(item["ok"] for item in checks),
        "configured": True,
        "provider_order": [provider.name for provider in providers],
        "providers": checks,
    }
