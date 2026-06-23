"""Draft-generation helpers for AdPilot marketplace actions."""

from __future__ import annotations

from typing import Any

from database import MarketplaceProduct, MarketplaceProvider
from services.content_tools import (
    TOOL_BY_SLUG,
    build_prompt,
    fallback_output,
    normalize_language,
)
from services.marketplace_integrations import json_loads


SAFE_AUTO_PUBLISH_ACTIONS = {"buyer_reply"}

ACTION_TOOL_MAP = {
    "avito_listing": "avito-ad",
    "buyer_reply": "avito-reply",
    "improve_card": "ozon-wb-card",
    "seo_refresh": "ozon-wb-card",
    "promo_plan": "yandex-ads",
    "image_brief": "product-description",
}


def product_context(product: MarketplaceProduct | None) -> dict[str, str]:
    if not product:
        return {}
    raw = json_loads(product.raw_payload, {})
    advantages = raw.get("advantages") or raw.get("brand") or raw.get("vendorCode") or product.category or ""
    return {
        "product": product.title or "",
        "price": product.price or "",
        "advantages": str(advantages),
        "targetCustomer": str(raw.get("targetCustomer") or raw.get("audience") or "marketplace buyers"),
        "city": str(raw.get("city") or ""),
        "description": product.description or "",
    }


def input_for_action(
    provider: MarketplaceProvider,
    action_type: str,
    product: MarketplaceProduct | None,
    input_data: dict[str, str],
) -> dict[str, str]:
    values = {**product_context(product), **input_data}
    if provider == MarketplaceProvider.avito and action_type == "buyer_reply":
        values.setdefault("customerQuestion", input_data.get("customerQuestion") or input_data.get("message") or "Is this available?")
    if action_type == "promo_plan":
        values.setdefault("city", input_data.get("city") or "online")
        values.setdefault("offer", input_data.get("offer") or "marketplace promo")
    return values


def fallback_action_output(
    provider: MarketplaceProvider,
    action_type: str,
    input_data: dict[str, str],
    profile: dict[str, str],
    language: str,
) -> str:
    tool_slug = ACTION_TOOL_MAP.get(action_type, "product-description")
    return fallback_output(tool_slug, input_data, profile, language)


async def build_action_draft(
    provider: MarketplaceProvider,
    action_type: str,
    product: MarketplaceProduct | None,
    input_data: dict[str, str],
    profile: dict[str, str],
    output_language: str,
    generate_ai,
) -> tuple[dict[str, Any], str]:
    tool_slug = ACTION_TOOL_MAP.get(action_type, "product-description")
    tool = TOOL_BY_SLUG[tool_slug]
    action_input = input_for_action(provider, action_type, product, input_data)
    language = normalize_language(output_language, action_input, profile)
    prompt = "\n".join(
        [
            build_prompt(tool, action_input, profile, language),
            "",
            "Marketplace action:",
            f"- Provider: {provider.value}",
            f"- Action type: {action_type}",
            "- Return copy that can be reviewed by a seller before publishing.",
            "- For marketplace card updates, separate title, bullets, description, keywords, and compliance notes.",
        ]
    )

    text, warning = await generate_ai(prompt)
    provider_name = "text-ai"
    if not text:
        text = fallback_action_output(provider, action_type, action_input, profile, language)
        provider_name = "local-template"

    title = title_for_action(provider, action_type, product)
    payload = {
        "provider": provider.value,
        "action_type": action_type,
        "title": title,
        "copy": text,
        "input": action_input,
        "product": serialize_product(product),
        "language": language,
        "ai_provider": provider_name,
        "warning": warning,
        "review_required": True,
    }
    return payload, provider_name


def title_for_action(provider: MarketplaceProvider, action_type: str, product: MarketplaceProduct | None) -> str:
    product_name = product.title if product else "Manual product"
    labels = {
        "avito_listing": "Avito listing",
        "buyer_reply": "Buyer reply",
        "improve_card": "Product card improvement",
        "seo_refresh": "SEO refresh",
        "promo_plan": "Promo plan",
        "image_brief": "Image brief",
    }
    return f"{labels.get(action_type, action_type.replace('_', ' ').title())}: {product_name}"[:255]


def serialize_product(product: MarketplaceProduct | None) -> dict[str, Any] | None:
    if not product:
        return None
    return {
        "id": str(product.id),
        "provider": product.provider.value if hasattr(product.provider, "value") else str(product.provider),
        "external_product_id": product.external_product_id,
        "title": product.title,
        "sku": product.sku,
        "category": product.category,
        "price": product.price,
        "stock": product.stock,
        "image_url": product.image_url,
        "description": product.description,
    }


def action_summary(action) -> dict[str, Any]:
    return {
        "id": str(action.id),
        "provider": action.provider.value if hasattr(action.provider, "value") else str(action.provider),
        "action_type": action.action_type,
        "title": action.title,
        "status": action.status.value if hasattr(action.status, "value") else str(action.status),
        "approval_required": action.approval_required,
        "source": action.source,
        "draft": json_loads(action.draft_payload, {}),
        "result": json_loads(action.result_payload, None),
        "error": action.error,
        "created_at": action.created_at,
        "approved_at": action.approved_at,
        "published_at": action.published_at,
    }
