"""DomStudio — Tokens Router"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
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
    amount: Annotated[int, Query(gt=0)],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Called internally by generation service before each job."""
    result = await db.execute(
        update(TokenBalance)
        .where(
            TokenBalance.user_id == current_user.id,
            TokenBalance.balance >= amount,
        )
        .values(balance=TokenBalance.balance - amount)
        .returning(TokenBalance.balance)
    )
    balance = result.scalar_one_or_none()
    if balance is None:
        raise HTTPException(402, "Insufficient tokens")
    return {"balance": balance, "deducted": amount}
