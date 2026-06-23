"""Marketplace connections and AdPilot automation routes."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import (
    AdPilotAction,
    AdPilotActionStatus,
    AdPilotRule,
    MarketplaceConnection,
    MarketplaceConnectionStatus,
    MarketplaceProduct,
    MarketplaceProvider,
    User,
    get_db,
)
from dependencies import get_current_user
from routers.content import generate_with_text_backend
from services.adpilot_engine import SAFE_AUTO_PUBLISH_ACTIONS, action_summary, build_action_draft
from services.content_tools import clean_mapping
from services.marketplace_integrations import (
    MarketplaceError,
    fetch_products,
    json_dumps,
    json_loads,
    normalize_product,
    provider_catalog,
    provider_from_str,
    publish_action,
)
from services.marketplace_security import decrypt_secret, encrypt_secret


router = APIRouter()


class ConnectMarketplaceRequest(BaseModel):
    provider: str = Field(min_length=1, max_length=30)
    display_name: str | None = Field(default=None, max_length=120)
    api_token: str | None = Field(default=None, max_length=5000)
    client_id: str | None = Field(default=None, max_length=500)
    mode: str = Field(default="draft", pattern="^(draft|live)$")
    scopes: list[str] = Field(default_factory=list)
    extra_config: dict[str, Any] = Field(default_factory=dict)


class ProductImportRequest(BaseModel):
    products: list[dict[str, Any]] = Field(default_factory=list)
    live_fetch: bool = False
    limit: int = Field(default=50, ge=1, le=500)


class GenerateActionRequest(BaseModel):
    provider: str = Field(min_length=1, max_length=30)
    connection_id: UUID | None = None
    product_id: UUID | None = None
    action_type: str = Field(default="improve_card", max_length=80)
    input: dict[str, str] = Field(default_factory=dict)
    profile: dict[str, str] = Field(default_factory=dict)
    output_language: str | None = Field(default="auto", max_length=20)
    approval_required: bool = True
    source: str = Field(default="manual", max_length=80)


class RuleRequest(BaseModel):
    provider: str = Field(min_length=1, max_length=30)
    connection_id: UUID | None = None
    name: str = Field(min_length=1, max_length=160)
    trigger_type: str = Field(min_length=1, max_length=80)
    action_type: str = Field(min_length=1, max_length=80)
    conditions: dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True
    approval_required: bool = True


class EvaluateRulesRequest(BaseModel):
    provider: str | None = Field(default=None, max_length=30)
    connection_id: UUID | None = None
    product_ids: list[UUID] = Field(default_factory=list)
    event: dict[str, Any] = Field(default_factory=dict)
    profile: dict[str, str] = Field(default_factory=dict)
    output_language: str | None = Field(default="auto", max_length=20)


def serialize_connection(connection: MarketplaceConnection) -> dict[str, Any]:
    return {
        "id": str(connection.id),
        "provider": connection.provider.value if hasattr(connection.provider, "value") else str(connection.provider),
        "display_name": connection.display_name,
        "status": connection.status.value if hasattr(connection.status, "value") else str(connection.status),
        "mode": connection.mode,
        "scopes": json_loads(connection.scopes, []),
        "extra_config": _redact_config(json_loads(connection.extra_config, {})),
        "last_sync_at": connection.last_sync_at,
        "last_error": connection.last_error,
        "created_at": connection.created_at,
    }


def serialize_product(product: MarketplaceProduct) -> dict[str, Any]:
    return {
        "id": str(product.id),
        "provider": product.provider.value if hasattr(product.provider, "value") else str(product.provider),
        "connection_id": str(product.connection_id) if product.connection_id else None,
        "external_product_id": product.external_product_id,
        "title": product.title,
        "sku": product.sku,
        "category": product.category,
        "price": product.price,
        "stock": product.stock,
        "image_url": product.image_url,
        "description": product.description,
        "last_synced_at": product.last_synced_at,
    }


def serialize_rule(rule: AdPilotRule) -> dict[str, Any]:
    return {
        "id": str(rule.id),
        "provider": rule.provider.value if hasattr(rule.provider, "value") else str(rule.provider),
        "connection_id": str(rule.connection_id) if rule.connection_id else None,
        "name": rule.name,
        "trigger_type": rule.trigger_type,
        "action_type": rule.action_type,
        "conditions": json_loads(rule.conditions, {}),
        "enabled": rule.enabled,
        "approval_required": rule.approval_required,
        "last_run_at": rule.last_run_at,
        "created_at": rule.created_at,
    }


def _redact_config(config: dict[str, Any]) -> dict[str, Any]:
    return {key: ("***" if "token" in key.lower() or "secret" in key.lower() else value) for key, value in config.items()}


async def _connection_for_user(db: AsyncSession, user_id, connection_id: UUID) -> MarketplaceConnection:
    connection = await db.scalar(
        select(MarketplaceConnection).where(
            MarketplaceConnection.id == connection_id,
            MarketplaceConnection.user_id == user_id,
        )
    )
    if not connection:
        raise HTTPException(404, "Marketplace connection not found")
    return connection


async def _product_for_user(db: AsyncSession, user_id, product_id: UUID) -> MarketplaceProduct:
    product = await db.scalar(
        select(MarketplaceProduct).where(
            MarketplaceProduct.id == product_id,
            MarketplaceProduct.user_id == user_id,
        )
    )
    if not product:
        raise HTTPException(404, "Marketplace product not found")
    return product


@router.get("/providers")
async def list_marketplace_providers():
    return {"providers": provider_catalog()}


@router.post("/connections")
async def connect_marketplace(
    req: ConnectMarketplaceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        provider = provider_from_str(req.provider)
    except MarketplaceError as exc:
        raise HTTPException(400, str(exc)) from exc

    status = MarketplaceConnectionStatus.connected if req.api_token or req.mode == "draft" else MarketplaceConnectionStatus.draft
    connection = MarketplaceConnection(
        user_id=current_user.id,
        provider=provider,
        display_name=req.display_name,
        status=status,
        mode=req.mode,
        api_token_enc=encrypt_secret(req.api_token),
        client_id_enc=encrypt_secret(req.client_id),
        extra_config=json_dumps(req.extra_config),
        scopes=json_dumps(req.scopes),
    )
    db.add(connection)
    await db.flush()
    return {"connection": serialize_connection(connection)}


@router.get("/connections")
async def list_connections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = await db.scalars(
        select(MarketplaceConnection)
        .where(MarketplaceConnection.user_id == current_user.id)
        .order_by(MarketplaceConnection.created_at.desc())
    )
    return {"connections": [serialize_connection(row) for row in rows]}


@router.post("/connections/{connection_id}/sync-products")
async def sync_products(
    connection_id: UUID,
    req: ProductImportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connection = await _connection_for_user(db, current_user.id, connection_id)
    raw_products = req.products
    error = None

    if req.live_fetch:
        extra = json_loads(connection.extra_config, {})
        extra["limit"] = req.limit
        try:
            raw_products = await fetch_products(
                connection.provider,
                decrypt_secret(connection.api_token_enc),
                decrypt_secret(connection.client_id_enc),
                extra,
            )
        except MarketplaceError as exc:
            error = str(exc)
            connection.status = MarketplaceConnectionStatus.error
            connection.last_error = error
            raise HTTPException(400, error) from exc

    now = datetime.now(timezone.utc)
    imported: list[MarketplaceProduct] = []
    for raw in raw_products[: req.limit]:
        normalized = normalize_product(connection.provider, raw)
        product = MarketplaceProduct(
            user_id=current_user.id,
            connection_id=connection.id,
            provider=connection.provider,
            external_product_id=normalized["external_product_id"],
            title=normalized["title"],
            sku=normalized["sku"],
            category=normalized["category"],
            price=normalized["price"],
            stock=normalized["stock"],
            image_url=normalized["image_url"],
            description=normalized["description"],
            raw_payload=normalized["raw_payload"],
            last_synced_at=now,
        )
        db.add(product)
        imported.append(product)

    connection.status = MarketplaceConnectionStatus.connected
    connection.last_sync_at = now
    connection.last_error = error
    await db.flush()
    return {"imported": len(imported), "products": [serialize_product(product) for product in imported]}


@router.get("/products")
async def list_products(
    provider: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(MarketplaceProduct).where(MarketplaceProduct.user_id == current_user.id)
    if provider:
        try:
            stmt = stmt.where(MarketplaceProduct.provider == provider_from_str(provider))
        except MarketplaceError as exc:
            raise HTTPException(400, str(exc)) from exc
    rows = await db.scalars(stmt.order_by(MarketplaceProduct.created_at.desc()).limit(200))
    return {"products": [serialize_product(row) for row in rows]}


@router.post("/actions/generate")
async def generate_action(
    req: GenerateActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        provider = provider_from_str(req.provider)
    except MarketplaceError as exc:
        raise HTTPException(400, str(exc)) from exc

    connection = await _connection_for_user(db, current_user.id, req.connection_id) if req.connection_id else None
    product = await _product_for_user(db, current_user.id, req.product_id) if req.product_id else None
    if connection and connection.provider != provider:
        raise HTTPException(400, "Connection provider does not match action provider")
    if product and product.provider != provider:
        raise HTTPException(400, "Product provider does not match action provider")

    draft, ai_provider = await build_action_draft(
        provider=provider,
        action_type=req.action_type,
        product=product,
        input_data=clean_mapping(req.input),
        profile=clean_mapping(req.profile),
        output_language=req.output_language or "auto",
        generate_ai=generate_with_text_backend,
    )
    approval_required = req.approval_required or req.action_type not in SAFE_AUTO_PUBLISH_ACTIONS
    action = AdPilotAction(
        user_id=current_user.id,
        connection_id=connection.id if connection else None,
        product_id=product.id if product else None,
        provider=provider,
        action_type=req.action_type,
        title=draft["title"],
        status=AdPilotActionStatus.draft,
        draft_payload=json_dumps(draft),
        approval_required=approval_required,
        source=req.source,
    )
    db.add(action)
    await db.flush()
    return {"action": action_summary(action), "provider": ai_provider}


@router.get("/actions")
async def list_actions(
    status: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(AdPilotAction).where(AdPilotAction.user_id == current_user.id)
    if status:
        stmt = stmt.where(AdPilotAction.status == status)
    rows = await db.scalars(stmt.order_by(AdPilotAction.created_at.desc()).limit(200))
    return {"actions": [action_summary(row) for row in rows]}


@router.post("/actions/{action_id}/approve")
async def approve_action(
    action_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = await db.scalar(select(AdPilotAction).where(AdPilotAction.id == action_id, AdPilotAction.user_id == current_user.id))
    if not action:
        raise HTTPException(404, "AdPilot action not found")
    action.status = AdPilotActionStatus.approved
    action.approved_at = datetime.now(timezone.utc)
    await db.flush()
    return {"action": action_summary(action)}


@router.post("/actions/{action_id}/publish")
async def publish_approved_action(
    action_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = await db.scalar(select(AdPilotAction).where(AdPilotAction.id == action_id, AdPilotAction.user_id == current_user.id))
    if not action:
        raise HTTPException(404, "AdPilot action not found")
    if action.status not in {AdPilotActionStatus.approved, AdPilotActionStatus.draft}:
        raise HTTPException(400, f"Cannot publish action in status {action.status}")
    if action.approval_required and action.status != AdPilotActionStatus.approved:
        raise HTTPException(400, "Action must be approved before publishing")

    connection = await _connection_for_user(db, current_user.id, action.connection_id) if action.connection_id else None
    action.status = AdPilotActionStatus.publishing
    try:
        result = await publish_action(
            provider=action.provider,
            connection_mode=connection.mode if connection else "draft",
            action_type=action.action_type,
            payload=json_loads(action.draft_payload, {}),
        )
        action.result_payload = json_dumps(result)
        action.status = AdPilotActionStatus.synced if result.get("published") else AdPilotActionStatus.approved
        action.published_at = datetime.now(timezone.utc) if result.get("published") else None
    except MarketplaceError as exc:
        action.status = AdPilotActionStatus.failed
        action.error = str(exc)
    await db.flush()
    return {"action": action_summary(action)}


@router.post("/rules")
async def create_rule(
    req: RuleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        provider = provider_from_str(req.provider)
    except MarketplaceError as exc:
        raise HTTPException(400, str(exc)) from exc
    connection = await _connection_for_user(db, current_user.id, req.connection_id) if req.connection_id else None
    if connection and connection.provider != provider:
        raise HTTPException(400, "Connection provider does not match rule provider")
    rule = AdPilotRule(
        user_id=current_user.id,
        connection_id=connection.id if connection else None,
        provider=provider,
        name=req.name,
        trigger_type=req.trigger_type,
        action_type=req.action_type,
        conditions=json_dumps(req.conditions),
        enabled=req.enabled,
        approval_required=req.approval_required,
    )
    db.add(rule)
    await db.flush()
    return {"rule": serialize_rule(rule)}


@router.get("/rules")
async def list_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = await db.scalars(
        select(AdPilotRule)
        .where(AdPilotRule.user_id == current_user.id)
        .order_by(AdPilotRule.created_at.desc())
    )
    return {"rules": [serialize_rule(row) for row in rows]}


@router.post("/rules/evaluate")
async def evaluate_rules(
    req: EvaluateRulesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = provider_from_str(req.provider) if req.provider else None
    stmt = select(AdPilotRule).where(AdPilotRule.user_id == current_user.id, AdPilotRule.enabled.is_(True))
    if provider:
        stmt = stmt.where(AdPilotRule.provider == provider)
    if req.connection_id:
        stmt = stmt.where(AdPilotRule.connection_id == req.connection_id)
    rules = list((await db.scalars(stmt)).all())
    products = []
    for product_id in req.product_ids:
        products.append(await _product_for_user(db, current_user.id, product_id))
    if not products:
        products = [None]

    created: list[AdPilotAction] = []
    for rule in rules:
        if not _event_matches_rule(req.event, json_loads(rule.conditions, {})):
            continue
        for product in products:
            draft, _ = await build_action_draft(
                provider=rule.provider,
                action_type=rule.action_type,
                product=product,
                input_data=clean_mapping(req.event),
                profile=clean_mapping(req.profile),
                output_language=req.output_language or "auto",
                generate_ai=generate_with_text_backend,
            )
            approval_required = rule.approval_required or rule.action_type not in SAFE_AUTO_PUBLISH_ACTIONS
            action = AdPilotAction(
                user_id=current_user.id,
                connection_id=rule.connection_id,
                product_id=product.id if product else None,
                provider=rule.provider,
                action_type=rule.action_type,
                title=draft["title"],
                status=AdPilotActionStatus.draft,
                draft_payload=json_dumps(draft),
                approval_required=approval_required,
                source=f"rule:{rule.id}",
            )
            db.add(action)
            created.append(action)
        rule.last_run_at = datetime.now(timezone.utc)

    await db.flush()
    return {"created": len(created), "actions": [action_summary(action) for action in created]}


def _event_matches_rule(event: dict[str, Any], conditions: dict[str, Any]) -> bool:
    if not conditions:
        return True
    for key, expected in conditions.items():
        if key == "min_stock":
            try:
                if int(event.get("stock", 999999)) >= int(expected):
                    return False
            except (TypeError, ValueError):
                return False
            continue
        if key == "contains":
            text = " ".join(str(value) for value in event.values()).lower()
            if str(expected).lower() not in text:
                return False
            continue
        if event.get(key) != expected:
            return False
    return True
