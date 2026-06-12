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
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from database import get_db, User, Payment, Subscription, TokenBalance, PaymentStatus, PaymentProvider, PlanName, PLANS, TOKEN_PACKS
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

# ─── SCHEMAS ─────────────────────────────────────────────────────────────────
class InitPaymentRequest(BaseModel):
    plan: PlanName

class TopUpRequest(BaseModel):
    pack_id: str

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

    plan_cfg   = PLANS[req.plan]
    amount_kop = int(plan_cfg["price_rub"] * 100)  # Tinkoff uses kopecks

    # Create pending payment record
    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.tinkoff,
        provider_order_id=f"DS-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=plan_cfg["price_rub"],
        plan=req.plan,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()

    # Call Tinkoff API
    result = await tinkoff_request("Init", {
        "Amount":      amount_kop,
        "OrderId":     str(payment.id),
        "Description": f"DomStudio {req.plan.value} — {plan_cfg['photos']} фото/мес",
        "NotificationURL": f"{os.getenv('API_URL','https://api.domstudio.ru')}/payments/tinkoff/webhook",
        "SuccessURL":  f"{FRONTEND_URL}/dashboard?payment=success",
        "FailURL":     f"{FRONTEND_URL}/pricing?payment=failed",
        "Receipt": {
            "Email":    current_user.email or "",
            "Phone":    current_user.phone or "",
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
        raise HTTPException(500, f"Tinkoff error: {result.get('Message')}")

    payment.provider_order_id = result["PaymentId"]
    return {
        "payment_id": str(payment.id),
        "payment_url": result["PaymentURL"],
    }


@router.post("/tinkoff/topup")
async def tinkoff_topup(
    req: TopUpRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.pack_id not in TOKEN_PACKS:
        raise HTTPException(400, "Unknown token pack")

    pack       = TOKEN_PACKS[req.pack_id]
    amount_kop = int(pack["price_rub"] * 100)

    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.tinkoff,
        provider_order_id=f"DS-TOP-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=pack["price_rub"],
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
            "Email":    current_user.email or "",
            "Phone":    current_user.phone or "",
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
        raise HTTPException(500, f"Tinkoff error: {result.get('Message')}")

    payment.provider_order_id = result["PaymentId"]
    return {
        "payment_id":  str(payment.id),
        "payment_url": result["PaymentURL"],
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
            .returning(Payment.id, Payment.user_id, Payment.plan, Payment.pack_id)
        )
        row = result.first()
        if row:
            if row.pack_id:
                await activate_topup(row.user_id, row.pack_id, db)
            else:
                await activate_subscription(row.user_id, row.plan, db)

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

    payment = Payment(
        user_id=current_user.id,
        provider=PaymentProvider.yandex_pay,
        provider_order_id=f"YP-{current_user.id}-{int(datetime.now().timestamp())}",
        amount_rub=plan_cfg["price_rub"],
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
                "discountedUnitPrice": str(plan_cfg["price_rub"]),
                "tax":         "NO_VAX",
                "quantity":    {"count": "1", "label": "шт"},
                "total":       str(plan_cfg["price_rub"]),
            }],
            "total": {"amount": str(plan_cfg["price_rub"]), "label": "Итого"},
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
            .returning(Payment.user_id, Payment.plan, Payment.pack_id)
        )
        row = result.first()
        if row:
            if row.pack_id:
                await activate_topup(row.user_id, row.pack_id, db)
            else:
                await activate_subscription(row.user_id, row.plan, db)
    elif event in ("ORDER_FAILED", "ORDER_CANCELLED"):
        await db.execute(
            update(Payment)
            .where(Payment.id == order_id)
            .values(status=PaymentStatus.failed)
        )

    return {"ok": True}


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
