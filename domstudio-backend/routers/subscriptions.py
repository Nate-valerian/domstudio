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
        limits = plan_limits("free")
        return {
            "plan": "free",
            "photos_used": 0,
            "photos_limit": 5,
            "videos_used": 0,
            "videos_limit": limits["videos_limit"],
            "premium_videos_used": 0,
            "premium_videos_limit": limits["premium_videos_limit"],
        }
    return {
        "plan":         sub.plan,
        "photos_used":  sub.photos_used,
        "photos_limit": sub.photos_limit,
        "videos_used":  sub.videos_used,
        "videos_limit": sub.videos_limit,
        "premium_videos_used":  sub.premium_videos_used,
        "premium_videos_limit": sub.premium_videos_limit,
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
