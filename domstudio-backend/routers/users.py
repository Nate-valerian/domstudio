"""DomStudio — Users Router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db, User, Subscription, TokenBalance, PLANS, PlanName
from dependencies import get_current_user
import uuid

router = APIRouter()

def plan_limits(plan):
    if isinstance(plan, str):
        plan = PlanName(plan)
    cfg = PLANS.get(plan) or PLANS[PlanName.free]
    return {
        "videos_limit": cfg["videos"],
        "premium_videos_limit": cfg["premium_videos"],
    }

REFERRAL_BONUS = 500
REFERRAL_BASE_URL = "https://domstudio.site/?ref="


@router.get("/referral")
async def get_referral(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await db.scalar(select(User).where(User.id == current_user.id))
    if not user.referral_code:
        user.referral_code = uuid.uuid4().hex[:8].upper()
        await db.commit()
        await db.refresh(user)

    referrals_count = await db.scalar(
        select(func.count()).where(
            User.referred_by_code == user.referral_code,
            User.is_verified == True,
        )
    ) or 0

    return {
        "code": user.referral_code,
        "link": f"{REFERRAL_BASE_URL}{user.referral_code}",
        "referrals_count": referrals_count,
        "tokens_per_referral": REFERRAL_BONUS,
        "tokens_earned": referrals_count * REFERRAL_BONUS,
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
            "videos_used":  sub.videos_used if sub else 0,
            "videos_limit": sub.videos_limit if sub else plan_limits(plan)["videos_limit"],
            "premium_videos_used":  sub.premium_videos_used if sub else 0,
            "premium_videos_limit": sub.premium_videos_limit if sub else plan_limits(plan)["premium_videos_limit"],
            "renews_at":    sub.renews_at if sub else None,
        } if sub else None,
        "tokens": bal.balance if bal else 0,
    }
