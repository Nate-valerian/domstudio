"""DomStudio — Subscriptions Router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, User, Subscription, PLANS
from dependencies import get_current_user

router = APIRouter()

@router.get("/me")
async def my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = await db.scalar(select(Subscription).where(Subscription.user_id == current_user.id))
    if not sub:
        return {"plan": "free", "photos_used": 0, "photos_limit": 5}
    return {
        "plan":         sub.plan,
        "photos_used":  sub.photos_used,
        "photos_limit": sub.photos_limit,
        "renews_at":    sub.renews_at,
    }

@router.get("/plans")
async def list_plans():
    return [
        {
            "name":       plan.value,
            "price_rub":  cfg["price_rub"],
            "photos":     cfg["photos"],
            "tokens":     cfg["tokens"],
        }
        for plan, cfg in PLANS.items()
    ]
