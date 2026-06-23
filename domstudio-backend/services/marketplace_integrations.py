"""Provider adapters for marketplace-connected AdPilot workflows.

The first production-safe step is draft automation. Live writes are routed
through these adapters so each marketplace can be enabled only after its exact
official API contract is verified for the seller account.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

from database import MarketplaceProvider


class MarketplaceError(RuntimeError):
    pass


def json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def json_loads(value: str | None, fallback: Any = None) -> Any:
    if not value:
        return fallback
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return fallback


@dataclass(frozen=True)
class ProviderCapabilities:
    provider: MarketplaceProvider
    label: str
    supports_product_import: bool
    supports_card_update: bool
    supports_messages: bool
    supports_price_stock: bool
    supports_live_publish: bool
    notes: str


PROVIDER_CAPABILITIES: dict[MarketplaceProvider, ProviderCapabilities] = {
    MarketplaceProvider.wildberries: ProviderCapabilities(
        provider=MarketplaceProvider.wildberries,
        label="Wildberries",
        supports_product_import=True,
        supports_card_update=True,
        supports_messages=True,
        supports_price_stock=True,
        supports_live_publish=False,
        notes="Drafts are enabled now. Live sync should use the seller Content, Prices, Stocks, Questions, and Feedback APIs after account testing.",
    ),
    MarketplaceProvider.ozon: ProviderCapabilities(
        provider=MarketplaceProvider.ozon,
        label="Ozon",
        supports_product_import=True,
        supports_card_update=True,
        supports_messages=False,
        supports_price_stock=True,
        supports_live_publish=False,
        notes="Drafts are enabled now. Live sync needs seller API key plus Client-Id and category-specific payload mapping.",
    ),
    MarketplaceProvider.avito: ProviderCapabilities(
        provider=MarketplaceProvider.avito,
        label="Avito",
        supports_product_import=True,
        supports_card_update=False,
        supports_messages=True,
        supports_price_stock=True,
        supports_live_publish=False,
        notes="Drafts are enabled now. Live sync depends on the seller's Avito business/API access and autoload/listing scopes.",
    ),
}


def provider_from_str(value: str) -> MarketplaceProvider:
    try:
        return MarketplaceProvider(value)
    except ValueError as exc:
        raise MarketplaceError(f"Unsupported marketplace provider: {value}") from exc


def provider_catalog() -> list[dict[str, Any]]:
    return [
        {
            "provider": item.provider.value,
            "label": item.label,
            "capabilities": {
                "product_import": item.supports_product_import,
                "card_update": item.supports_card_update,
                "messages": item.supports_messages,
                "price_stock": item.supports_price_stock,
                "live_publish": item.supports_live_publish,
            },
            "notes": item.notes,
            "safe_default": "draft_approval",
        }
        for item in PROVIDER_CAPABILITIES.values()
    ]


def normalize_product(provider: MarketplaceProvider, raw: dict[str, Any]) -> dict[str, Any]:
    title = str(raw.get("title") or raw.get("name") or raw.get("subject") or "Untitled product").strip()
    external_id = raw.get("external_product_id") or raw.get("id") or raw.get("nmID") or raw.get("offer_id") or raw.get("item_id")
    return {
        "provider": provider,
        "external_product_id": str(external_id) if external_id is not None else None,
        "title": title[:500],
        "sku": str(raw.get("sku") or raw.get("vendorCode") or raw.get("offer_id") or "")[:255] or None,
        "category": str(raw.get("category") or raw.get("subjectName") or raw.get("category_name") or "")[:255] or None,
        "price": str(raw.get("price") or raw.get("salePrice") or raw.get("marketing_price") or "")[:120] or None,
        "stock": _int_or_none(raw.get("stock") or raw.get("quantity") or raw.get("stocks")),
        "image_url": _first_image(raw),
        "description": str(raw.get("description") or raw.get("text") or "") or None,
        "raw_payload": json_dumps(raw),
    }


def _first_image(raw: dict[str, Any]) -> str | None:
    images = raw.get("images") or raw.get("photos") or raw.get("media")
    if isinstance(images, list) and images:
        first = images[0]
        if isinstance(first, str):
            return first[:1000]
        if isinstance(first, dict):
            return str(first.get("url") or first.get("big") or first.get("preview") or "")[:1000] or None
    value = raw.get("image_url") or raw.get("photo")
    return str(value)[:1000] if value else None


def _int_or_none(value: Any) -> int | None:
    if value is None or value == "":
        return None
    if isinstance(value, list):
        total = 0
        found = False
        for item in value:
            if isinstance(item, dict):
                parsed = _int_or_none(item.get("quantity") or item.get("stock"))
                if parsed is not None:
                    total += parsed
                    found = True
        return total if found else None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


async def fetch_products(
    provider: MarketplaceProvider,
    api_token: str | None,
    client_id: str | None,
    extra: dict[str, Any],
) -> list[dict[str, Any]]:
    if provider == MarketplaceProvider.wildberries:
        return await _fetch_wb_products(api_token, extra)
    if provider == MarketplaceProvider.ozon:
        return await _fetch_ozon_products(api_token, client_id, extra)
    if provider == MarketplaceProvider.avito:
        return await _fetch_avito_products(api_token, extra)
    raise MarketplaceError(f"Unsupported provider: {provider.value}")


async def _fetch_wb_products(api_token: str | None, extra: dict[str, Any]) -> list[dict[str, Any]]:
    if not api_token:
        raise MarketplaceError("Wildberries API token is required for live product import.")
    payload = {
        "settings": {
            "cursor": {"limit": int(extra.get("limit") or 50)},
            "filter": {"withPhoto": -1},
        }
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://content-api.wildberries.ru/content/v2/get/cards/list",
            headers={"Authorization": api_token},
            json=payload,
        )
    if not response.is_success:
        raise MarketplaceError(f"Wildberries product import failed with {response.status_code}: {response.text[:300]}")
    data = response.json()
    return data.get("cards") or data.get("data", {}).get("cards") or []


async def _fetch_ozon_products(api_token: str | None, client_id: str | None, extra: dict[str, Any]) -> list[dict[str, Any]]:
    if not api_token or not client_id:
        raise MarketplaceError("Ozon API token and Client-Id are required for live product import.")
    payload = {"filter": {}, "limit": int(extra.get("limit") or 50)}
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api-seller.ozon.ru/v3/product/list",
            headers={"Api-Key": api_token, "Client-Id": client_id, "Content-Type": "application/json"},
            json=payload,
        )
    if not response.is_success:
        raise MarketplaceError(f"Ozon product import failed with {response.status_code}: {response.text[:300]}")
    items = response.json().get("result", {}).get("items", [])
    return items


async def _fetch_avito_products(api_token: str | None, extra: dict[str, Any]) -> list[dict[str, Any]]:
    if not api_token:
        raise MarketplaceError("Avito API token is required for live product import.")
    user_id = extra.get("user_id") or extra.get("avito_user_id")
    if not user_id:
        raise MarketplaceError("Avito user_id is required for live listing import.")
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"https://api.avito.ru/core/v1/accounts/{user_id}/items",
            headers={"Authorization": f"Bearer {api_token}"},
            params={"per_page": int(extra.get("limit") or 50)},
        )
    if not response.is_success:
        raise MarketplaceError(f"Avito listing import failed with {response.status_code}: {response.text[:300]}")
    data = response.json()
    return data.get("resources") or data.get("items") or []


async def publish_action(
    provider: MarketplaceProvider,
    connection_mode: str,
    action_type: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    if connection_mode != "live":
        return {
            "published": False,
            "dry_run": True,
            "message": "Connection is in draft mode. Action was approved but not sent to the marketplace.",
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }

    caps = PROVIDER_CAPABILITIES[provider]
    if not caps.supports_live_publish:
        return {
            "published": False,
            "dry_run": True,
            "message": f"{caps.label} live publishing is intentionally disabled until official API payload mapping is verified.",
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "action_type": action_type,
            "payload_preview": payload,
        }

    raise MarketplaceError(f"Live publish adapter is not implemented for {provider.value}.")
