"""
DomStudio — Payments Router
POST /payments/tinkoff/init          — create Tinkoff payment, get payment URL
POST /payments/tinkoff/topup         — buy a token top-up pack via Tinkoff
POST /payments/tinkoff/webhook       — Tinkoff server notification
POST /payments/yandex/init           — create Yandex Pay order
POST /payments/yandex/webhook        — Yandex Pay notification
GET  /payments/history               — user payment history
GET  /payments/packs                 — list available token top-up packs
"""

import os
import hmac
import hashlib
import json
import uuid
import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, field_validator
from datetime import datetime, timezone, timedelta

from database import (
    get_db,
    User,
    Payment,
    PromoCode,
    CommissionLedger,
    Subscription,
    TokenBalance,
    PaymentStatus,
    PaymentProvider,
    PayoutStatus,
    PlanName,
    PLANS,
    TOKEN_PACKS,
)
from dependencies import get_current_user

router = APIRouter()

# ─── TINKOFF CONFIG ──────────────────────────────────────────────────────────
TINKOFF_TERMINAL = os.getenv("TINKOFF_TERMINAL_KEY", "")
TINKOFF_SECRET   = os.getenv("TINKOFF_SECRET_KEY", "")
TINKOFF_BASE     = "https://securepay.tinkoff.ru/v2"
FRONTEND_URL     = os.getenv("FRONTEND_URL", "https://domstudio.site")

# ─── YANDEX PAY CONFIG ───────────────────────────────────────────────────────
YANDEX_MERCHANT_ID = os.getenv("YANDEX_PAY_MERCHANT_ID", "")
YANDEX_SECRET      = os.getenv("YANDEX_PAY_SECRET", "")
YANDEX_BASE        = "https://pay.yandex.ru/api/merchant/v1"

# ─── TINKOFF HELPERS ─────────────────────────────────────────────────────────
def tinkoff_sign(params: dict) -> str:
    """
    T-Bank signature: sort scalar root fields alphabetically, concat values,
    then SHA256. Token, null values, and nested objects are excluded.
    """
    filtered = {
        key: str(value).lower() if isinstance(value, bool) else str(value)
        for key, value in params.items()
        if key != "Token"
        and value is not None
        and not isinstance(value, (dict, list))
    }
    filtered["Password"] = TINKOFF_SECRET
    sorted_vals = "".join(filtered[k] for k in sorted(filtered.keys()))
    return hashlib.sha256(sorted_vals.encode()).hexdigest()

async def tinkoff_request(endpoint: str, payload: dict) -> dict:
    payload["TerminalKey"] = TINKOFF_TERMINAL
    payload["Token"]       = tinkoff_sign(payload)
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{TINKOFF_BASE}/{endpoint}", json=payload)
        return resp.json()

# ─── YANDEX PAY HELPERS ──────────────────────────────────────────────────────
def yandex_sign(body: str) -> str:
    return hmac.new(YANDEX_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()


# ─── PROMO HELPERS ────────────────────────────────────────────────────────────
def normalize_promo_code(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().upper()
    return normalized or None


def round_rub(value: float) -> float:
    return round(float(value) + 1e-9, 2)


def aware_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


async def resolve_promo_checkout(
    db: AsyncSession,
    current_user: User,
    promo_code: str | None,
    original_amount_rub: float,
) -> dict:
    original_amount_rub = round_rub(original_amount_rub)
    if not promo_code:
        return {
            "promo": None,
            "original_amount_rub": original_amount_rub,
            "discount_amount_rub": 0.0,
            "amount_rub": original_amount_rub,
            "discount_percent": None,
        }

    promo = await db.scalar(
        select(PromoCode)
        .where(PromoCode.code == promo_code)
        .options(selectinload(PromoCode.parent))
    )
    if not promo:
        raise HTTPException(400, "Promo code not found")
    if not promo.active:
        raise HTTPException(400, promo.paused_reason or "Promo code is not active")

    now = datetime.now(timezone.utc)
    starts_at = aware_utc(promo.starts_at)
    expires_at = aware_utc(promo.expires_at)
    if starts_at and starts_at > now:
        raise HTTPException(400, "Promo code is not active yet")
    if expires_at and expires_at <= now:
        raise HTTPException(400, "Promo code has expired")

    if promo.owner_user_id and str(promo.owner_user_id) == str(current_user.id):
        raise HTTPException(400, "Promo code cannot be used for self-referral")
    if promo.parent and promo.parent.owner_user_id and str(promo.parent.owner_user_id) == str(current_user.id):
        raise HTTPException(400, "Promo code cannot be used for self-referral")

    previous_payment_id = await db.scalar(
        select(Payment.id)
        .where(
            Payment.user_id == current_user.id,
            Payment.status == PaymentStatus.succeeded,
        )
        .limit(1)
    )
    if previous_payment_id:
        raise HTTPException(400, "Promo codes are only available for the first paid purchase")

    discount_percent = float(promo.discount_percent or 0)
    if discount_percent <= 0 or discount_percent >= 100:
        raise HTTPException(400, "Promo code discount is invalid")

    discount_amount = round_rub(original_amount_rub * discount_percent / 100)
    amount_rub = round_rub(original_amount_rub - discount_amount)
    if amount_rub <= 0:
        raise HTTPException(400, "Promo code discount is invalid")

    return {
        "promo": promo,
        "original_amount_rub": original_amount_rub,
        "discount_amount_rub": discount_amount,
        "amount_rub": amount_rub,
        "discount_percent": discount_percent,
    }


def commission_amount(base_amount_rub: float, rate: float) -> float:
    return round_rub(float(base_amount_rub) * float(rate) / 100)


async def record_commissions(
    db: AsyncSession,
    payment_id,
    promo_code: str | None,
    base_amount_rub: float | None,
) -> None:
    if not promo_code or not base_amount_rub:
        return

    promo = await db.scalar(
        select(PromoCode)
        .where(PromoCode.code == promo_code)
        .options(selectinload(PromoCode.parent))
    )
    if not promo:
        return

    base_amount = round_rub(base_amount_rub)
    ledger_rows = [
        CommissionLedger(
            payment_id=payment_id,
            code=promo.code,
            base_amount_rub=base_amount,
            commission_rate=float(promo.commission_percent or 0),
            commission_amount_rub=commission_amount(base_amount, promo.commission_percent or 0),
            payee=promo.owner_label,
            payout_status=PayoutStatus.pending,
        )
    ]

    if promo.parent:
        ledger_rows.append(
            CommissionLedger(
                payment_id=payment_id,
                code=promo.parent.code,
                base_amount_rub=base_amount,
                commission_rate=float(promo.parent.commission_percent or 0),
                commission_amount_rub=commission_amount(base_amount, promo.parent.commission_percent or 0),
                payee=promo.parent.owner_label,
                payout_status=PayoutStatus.pending,
            )
        )

    for row in ledger_rows:
        if row.commission_rate > 0 and row.commission_amount_rub > 0:
            db.add(row)


def check_affiliate_admin_token(token: str | None) -> None:
    expected = os.getenv("AFFILIATE_ADMIN_TOKEN")
    if not expected or not token or not hmac.compare_digest(token, expected):
        raise HTTPException(403, "Affiliate report access denied")


# ─── SCHEMAS ─────────────────────────────────────────────────────────────────
class InitPaymentRequest(BaseModel):
    plan: PlanName
    promo_code: str | None = None

    @field_validator("promo_code")
    @classmethod
    def normalize_promo_code(cls, value: str | None) -> str | None:
        return normalize_promo_code(value)

class TopUpRequest(BaseModel):
    pack_id: str
    promo_code: str | None = None

    @field_validator("promo_code")
    @classmethod
    def normalize_promo_code(cls, value: str | None) -> str | None:
        return normalize_promo_code(value)


class PromoCodeCreateRequest(BaseModel):
    code: str
    owner_label: str
    owner_user_id: uuid.UUID | None = None
    parent_code: str | None = None
    discount_percent: float = 15
    commission_percent: float = 15
    active: bool = True
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    paused_reason: str | None = None

    @field_validator("code", "parent_code")
    @classmethod
    def normalize_codes(cls, value: str | None) -> str | None:
        return normalize_promo_code(value)

    @field_validator("discount_percent", "commission_percent")
    @classmethod
    def validate_percent(cls, value: float) -> float:
        if value < 0 or value >= 100:
            raise ValueError("percent must be between 0 and 99.99")
        return value

class TinkoffWebhook(BaseModel):
    TerminalKey: str
    OrderId:     str
    PaymentId:   str
    Status:      str
    Amount:      int
    Token:       str

# ─── TINKOFF ROUTES ──────────────────────────────────────────────────────────
@router.post("/tinkoff/init")
async def tinkoff_init(
    req: InitPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.plan == PlanName.free:
        raise HTTPException(400, "Cannot pay for free plan")
    if req.plan not in PLANS:
        raise HTTPException(400, "Plan is not available")

    plan_cfg = PLANS[req.plan]
    checkout = await resolve_promo_checkout(db, current_user, req.promo_code, plan_cfg["price_rub"])
    promo = checkout["promo"]
    amount_kop = int(round(checkout["amount_rub"] * 100))  # Tinkoff uses kopecks

    # Create pending payment record
    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.tinkoff,
        provider_order_id=f"DS-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=checkout["amount_rub"],
        original_amount_rub=checkout["original_amount_rub"],
        discount_amount_rub=checkout["discount_amount_rub"],
        promo_code=promo.code if promo else None,
        promo_discount_percent=checkout["discount_percent"],
        plan=req.plan,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()

    # Call Tinkoff API
    result = await tinkoff_request("Init", {
        "Amount":      amount_kop,
        "OrderId":     str(payment.id),
        "Description": f"DomStudio {req.plan.value} — {plan_cfg['photos']} фото + {plan_cfg['videos']} видео/мес",
        "NotificationURL": f"{os.getenv('API_URL','https://api.domstudio.ru')}/payments/tinkoff/webhook",
        "SuccessURL":  f"{FRONTEND_URL}/dashboard?payment=success",
        "FailURL":     f"{FRONTEND_URL}/pricing?payment=failed",
        "Receipt": {
            **( {"Email": current_user.email} if current_user.email else {} ),
            **( {"Phone": current_user.phone} if current_user.phone else {} ),
            "Taxation": "usn_income",
            "Items": [{
                "Name":     f"DomStudio {req.plan.value}",
                "Price":    amount_kop,
                "Quantity": 1,
                "Amount":   amount_kop,
                "Tax":      "none",
            }]
        }
    })

    if not result.get("Success"):
        raise HTTPException(502, f"Tinkoff error: {result.get('Message')} (code: {result.get('ErrorCode')})")

    payment.provider_order_id = result["PaymentId"]
    return {
        "payment_id": str(payment.id),
        "payment_url": result["PaymentURL"],
        "amount_rub": checkout["amount_rub"],
        "original_amount_rub": checkout["original_amount_rub"],
        "discount_amount_rub": checkout["discount_amount_rub"],
        "promo_code": promo.code if promo else None,
    }


@router.post("/tinkoff/topup")
async def tinkoff_topup(
    req: TopUpRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.pack_id not in TOKEN_PACKS:
        raise HTTPException(400, "Unknown token pack")

    pack = TOKEN_PACKS[req.pack_id]
    checkout = await resolve_promo_checkout(db, current_user, req.promo_code, pack["price_rub"])
    promo = checkout["promo"]
    amount_kop = int(round(checkout["amount_rub"] * 100))

    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.tinkoff,
        provider_order_id=f"DS-TOP-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=checkout["amount_rub"],
        original_amount_rub=checkout["original_amount_rub"],
        discount_amount_rub=checkout["discount_amount_rub"],
        promo_code=promo.code if promo else None,
        promo_discount_percent=checkout["discount_percent"],
        pack_id=req.pack_id,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()

    result = await tinkoff_request("Init", {
        "Amount":      amount_kop,
        "OrderId":     str(payment.id),
        "Description": f"DomStudio токены +{pack['tokens']}",
        "NotificationURL": f"{os.getenv('API_URL','https://api.domstudio.ru')}/payments/tinkoff/webhook",
        "SuccessURL":  f"{FRONTEND_URL}/?payment=success",
        "FailURL":     f"{FRONTEND_URL}/?payment=failed",
        "Receipt": {
            **( {"Email": current_user.email} if current_user.email else {} ),
            **( {"Phone": current_user.phone} if current_user.phone else {} ),
            "Taxation": "usn_income",
            "Items": [{
                "Name":     pack["label"],
                "Price":    amount_kop,
                "Quantity": 1,
                "Amount":   amount_kop,
                "Tax":      "none",
            }]
        }
    })

    if not result.get("Success"):
        raise HTTPException(502, f"Tinkoff error: {result.get('Message')} (code: {result.get('ErrorCode')})")

    payment.provider_order_id = result["PaymentId"]
    return {
        "payment_id":  str(payment.id),
        "payment_url": result["PaymentURL"],
        "amount_rub": checkout["amount_rub"],
        "original_amount_rub": checkout["original_amount_rub"],
        "discount_amount_rub": checkout["discount_amount_rub"],
        "promo_code": promo.code if promo else None,
    }


@router.get("/packs")
async def list_packs():
    return [
        {"pack_id": pid, **cfg}
        for pid, cfg in TOKEN_PACKS.items()
    ]


@router.post("/tinkoff/webhook")
async def tinkoff_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(400, "Invalid payload")

    webhook = TinkoffWebhook.model_validate(payload)

    # Verify signature
    expected = tinkoff_sign(payload)
    if not hmac.compare_digest(expected, webhook.Token):
        raise HTTPException(400, "Invalid signature")

    # Use UPDATE … RETURNING to atomically flip status → prevents double-credit on retried webhooks
    if webhook.Status == "CONFIRMED":
        result = await db.execute(
            update(Payment)
            .where(
                Payment.provider_order_id == webhook.PaymentId,
                Payment.status == PaymentStatus.pending,
            )
            .values(status=PaymentStatus.succeeded)
            .returning(
                Payment.id,
                Payment.user_id,
                Payment.plan,
                Payment.pack_id,
                Payment.promo_code,
                Payment.amount_rub,
            )
        )
        row = result.first()
        if row:
            if row.pack_id:
                await activate_topup(row.user_id, row.pack_id, db)
            else:
                await activate_subscription(row.user_id, row.plan, db)
            await record_commissions(
                db,
                row.id,
                getattr(row, "promo_code", None),
                getattr(row, "amount_rub", None),
            )

    elif webhook.Status in ("CANCELED", "REJECTED", "DEADLINE_EXPIRED"):
        await db.execute(
            update(Payment)
            .where(Payment.provider_order_id == webhook.PaymentId)
            .values(status=PaymentStatus.failed)
        )

    return PlainTextResponse("OK")


# ─── YANDEX PAY ROUTES ───────────────────────────────────────────────────────
@router.post("/yandex/init")
async def yandex_init(
    req: InitPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.plan == PlanName.free:
        raise HTTPException(400, "Cannot pay for free plan")
    if req.plan not in PLANS:
        raise HTTPException(400, "Plan is not available")

    plan_cfg = PLANS[req.plan]
    checkout = await resolve_promo_checkout(db, current_user, req.promo_code, plan_cfg["price_rub"])
    promo = checkout["promo"]

    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.yandex_pay,
        provider_order_id=f"YP-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=checkout["amount_rub"],
        original_amount_rub=checkout["original_amount_rub"],
        discount_amount_rub=checkout["discount_amount_rub"],
        promo_code=promo.code if promo else None,
        promo_discount_percent=checkout["discount_percent"],
        plan=req.plan,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()

    order_payload = {
        "merchantId": YANDEX_MERCHANT_ID,
        "cart": {
            "externalId": str(payment.id),
            "items": [{
                "productId":   f"domstudio_{req.plan.value}",
                "title":       f"DomStudio {req.plan.value}",
                "unitPrice":   str(plan_cfg["price_rub"]),
                "discountedUnitPrice": str(checkout["amount_rub"]),
                "tax":         "NO_VAX",
                "quantity":    {"count": "1", "label": "шт"},
                "total":       str(checkout["amount_rub"]),
            }],
            "total": {"amount": str(checkout["amount_rub"]), "label": "Итого"},
        },
        "currencyCode":  "RUB",
        "orderId":       str(payment.id),
        "redirectUrls": {
            "onSuccess": f"{FRONTEND_URL}/dashboard?payment=success",
            "onError":   f"{FRONTEND_URL}/pricing?payment=failed",
        },
    }

    body = json.dumps(order_payload)
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{YANDEX_BASE}/orders",
            content=body,
            headers={
                "Authorization": f"Api-Key {YANDEX_SECRET}",
                "Content-Type":  "application/json",
                "X-Merchant-Id": YANDEX_MERCHANT_ID,
            }
        )
        result = resp.json()

    if resp.status_code != 200:
        raise HTTPException(500, f"Yandex Pay error: {result}")

    payment.provider_order_id = result["data"]["paymentUrl"]
    return {
        "payment_id":  str(payment.id),
        "payment_url": result["data"]["paymentUrl"],
        "amount_rub": checkout["amount_rub"],
        "original_amount_rub": checkout["original_amount_rub"],
        "discount_amount_rub": checkout["discount_amount_rub"],
        "promo_code": promo.code if promo else None,
    }


@router.post("/yandex/webhook")
async def yandex_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    sig  = request.headers.get("X-Ya-Signature", "")

    expected = hmac.new(YANDEX_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        raise HTTPException(400, "Invalid signature")

    data     = json.loads(body)
    order_id = data.get("orderId")
    event    = data.get("eventType")

    if event == "ORDER_PAID":
        result = await db.execute(
            update(Payment)
            .where(Payment.id == order_id, Payment.status == PaymentStatus.pending)
            .values(status=PaymentStatus.succeeded)
            .returning(
                Payment.id,
                Payment.user_id,
                Payment.plan,
                Payment.pack_id,
                Payment.promo_code,
                Payment.amount_rub,
            )
        )
        row = result.first()
        if row:
            if row.pack_id:
                await activate_topup(row.user_id, row.pack_id, db)
            else:
                await activate_subscription(row.user_id, row.plan, db)
            await record_commissions(
                db,
                row.id,
                getattr(row, "promo_code", None),
                getattr(row, "amount_rub", None),
            )
    elif event in ("ORDER_FAILED", "ORDER_CANCELLED"):
        await db.execute(
            update(Payment)
            .where(Payment.id == order_id)
            .values(status=PaymentStatus.failed)
        )

    return {"ok": True}


# ─── AFFILIATE REPORT ────────────────────────────────────────────────────────
@router.post("/affiliate/promo-codes")
async def create_affiliate_promo_code(
    req: PromoCodeCreateRequest,
    db: AsyncSession = Depends(get_db),
    x_affiliate_admin_token: str | None = Header(default=None),
):
    check_affiliate_admin_token(x_affiliate_admin_token)
    if not req.code:
        raise HTTPException(400, "Promo code is required")
    if not req.owner_label.strip():
        raise HTTPException(400, "Owner label is required")

    existing = await db.scalar(select(PromoCode).where(PromoCode.code == req.code))
    if existing:
        raise HTTPException(409, "Promo code already exists")

    if req.parent_code:
        parent = await db.scalar(select(PromoCode).where(PromoCode.code == req.parent_code))
        if not parent:
            raise HTTPException(400, "Parent promo code not found")

    promo = PromoCode(
        code=req.code,
        owner_label=req.owner_label.strip(),
        owner_user_id=req.owner_user_id,
        parent_code=req.parent_code,
        discount_percent=req.discount_percent,
        commission_percent=req.commission_percent,
        active=req.active,
        starts_at=req.starts_at,
        expires_at=req.expires_at,
        paused_reason=req.paused_reason,
    )
    db.add(promo)
    await db.flush()
    return {
        "code": promo.code,
        "owner_label": promo.owner_label,
        "owner_user_id": str(promo.owner_user_id) if promo.owner_user_id else None,
        "parent_code": promo.parent_code,
        "discount_percent": promo.discount_percent,
        "commission_percent": promo.commission_percent,
        "active": promo.active,
        "starts_at": promo.starts_at,
        "expires_at": promo.expires_at,
        "paused_reason": promo.paused_reason,
    }


@router.get("/affiliate/report")
async def affiliate_report(
    db: AsyncSession = Depends(get_db),
    x_affiliate_admin_token: str | None = Header(default=None),
):
    check_affiliate_admin_token(x_affiliate_admin_token)
    result = await db.execute(
        select(CommissionLedger)
        .order_by(CommissionLedger.created_at.desc())
        .limit(500)
    )
    rows = result.scalars().all()
    return [
        {
            "id": str(row.id),
            "payment_id": str(row.payment_id),
            "code": row.code,
            "base_amount_rub": row.base_amount_rub,
            "commission_rate": row.commission_rate,
            "commission_amount_rub": row.commission_amount_rub,
            "payee": row.payee,
            "payout_status": row.payout_status,
            "created_at": row.created_at,
        }
        for row in rows
    ]


# ─── PAYMENT HISTORY ─────────────────────────────────────────────────────────
@router.get("/history")
async def payment_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .limit(50)
    )
    payments = result.scalars().all()
    return [
        {
            "id":         str(p.id),
            "plan":       p.plan,
            "amount_rub": p.amount_rub,
            "original_amount_rub": p.original_amount_rub,
            "discount_amount_rub": p.discount_amount_rub,
            "promo_code": p.promo_code,
            "status":     p.status,
            "provider":   p.provider,
            "created_at": p.created_at,
        }
        for p in payments
    ]


# ─── SUBSCRIPTION ACTIVATION ────────────────────────────────────────────────
async def activate_subscription(user_id, plan: PlanName, db: AsyncSession):
    """Called after successful plan payment — upgrades plan, resets quota, tops up tokens."""
    from sqlalchemy.orm import selectinload
    user = await db.scalar(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.subscription), selectinload(User.token_balance))
    )
    if not user:
        return

    plan_cfg  = PLANS[plan]
    renews_at = datetime.now(timezone.utc) + timedelta(days=30)

    if user.subscription:
        user.subscription.plan         = plan
        user.subscription.photos_used  = 0
        user.subscription.photos_limit = plan_cfg["photos"]
        user.subscription.videos_used  = 0
        user.subscription.videos_limit = plan_cfg["videos"]
        user.subscription.premium_videos_used  = 0
        user.subscription.premium_videos_limit = plan_cfg["premium_videos"]
        user.subscription.renews_at    = renews_at

    if user.token_balance:
        user.token_balance.balance += plan_cfg["tokens"]


async def activate_topup(user_id, pack_id: str, db: AsyncSession):
    """Called after successful top-up payment — adds tokens without changing the plan."""
    pack = TOKEN_PACKS.get(pack_id)
    if not pack:
        return
    await db.execute(
        update(TokenBalance)
        .where(TokenBalance.user_id == user_id)
        .values(balance=TokenBalance.balance + pack["tokens"])
    )
