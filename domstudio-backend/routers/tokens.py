"""DomStudio — Tokens Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, User, TokenBalance
from dependencies import get_current_user

router = APIRouter()

@router.get("/balance")
async def token_balance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bal = await db.scalar(select(TokenBalance).where(TokenBalance.user_id == current_user.id))
    return {"balance": bal.balance if bal else 0}

@router.post("/deduct")
async def deduct_tokens(
    amount: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Called internally by generation service before each job."""
    bal = await db.scalar(select(TokenBalance).where(TokenBalance.user_id == current_user.id))
    if not bal or bal.balance < amount:
        raise HTTPException(402, "Insufficient tokens")
    bal.balance -= amount
    return {"balance": bal.balance, "deducted": amount}
