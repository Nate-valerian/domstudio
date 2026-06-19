"""DomStudio — Subscriptions Router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, User, Subscription, PLANS, PlanName
from dependencies import get_current_user

router = APIRouter()

def plan_limits(plan):
    if isinstance(plan, str):
        plan = PlanName(plan)
    cfg = PLANS.get(plan) or PLANS[next(iter(PLANS))]
    return {
        "videos_limit": cfg["videos"],
        "premium_videos_limit": cfg["premium_videos"],
    }

@router.get("/me")
async def my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = await db.scalar(select(Subscription).where(Subscription.user_id == current_user.id))
    if not sub:
        return {"plan": "free", "photos_used": 0, "photos_limit": 5, **plan_limits("free")}
    return {
        "plan":         sub.plan,
        "photos_used":  sub.photos_used,
        "photos_limit": sub.photos_limit,
        **plan_limits(sub.plan),
        "renews_at":    sub.renews_at,
    }

@router.get("/plans")
async def list_plans():
    return [
        {
            "name":       plan.value,
            "price_rub":  cfg["price_rub"],
            "photos":     cfg["photos"],
            "videos":     cfg["videos"],
            "premium_videos": cfg["premium_videos"],
            "tokens":     cfg["tokens"],
        }
        for plan, cfg in PLANS.items()
    ]
