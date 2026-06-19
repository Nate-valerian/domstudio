"""DomStudio — Users Router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db, User, Subscription, TokenBalance, PLANS, PlanName
from dependencies import get_current_user

router = APIRouter()

def plan_limits(plan):
    if isinstance(plan, str):
        plan = PlanName(plan)
    cfg = PLANS.get(plan) or PLANS[PlanName.free]
    return {
        "videos_limit": cfg["videos"],
        "premium_videos_limit": cfg["premium_videos"],
    }

@router.get("/me/full")
async def me_full(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await db.scalar(
        select(User)
        .where(User.id == current_user.id)
        .options(
            selectinload(User.subscription),
            selectinload(User.token_balance),
        )
    )
    sub = user.subscription
    bal = user.token_balance
    plan = sub.plan if sub else PlanName.free
    return {
        "id":           str(user.id),
        "email":        user.email,
        "phone":        user.phone,
        "is_verified":  user.is_verified,
        "subscription": {
            "plan":         plan,
            "photos_used":  sub.photos_used if sub else 0,
            "photos_limit": sub.photos_limit if sub else 5,
            **plan_limits(plan),
            "renews_at":    sub.renews_at if sub else None,
        } if sub else None,
        "tokens": bal.balance if bal else 0,
    }
