"""
DomStudio — Auth Router
POST /auth/register/email
POST /auth/register/phone
POST /auth/verify/email
POST /auth/verify/phone
POST /auth/login/email
POST /auth/login/phone
POST /auth/refresh
POST /auth/logout
GET  /auth/me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timezone
import re

from database import get_db, User, Subscription, TokenBalance, OtpCode, RefreshToken, PLANS, PlanName
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token, hash_token,
    generate_otp, otp_expires_at,
    send_email_otp, send_sms_otp,
)
from dependencies import get_current_user

router = APIRouter()

# ─── SCHEMAS ─────────────────────────────────────────────────────────────────
class EmailRegisterRequest(BaseModel):
    email:    EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def strong_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class PhoneRegisterRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10 or len(digits) > 12:
            raise ValueError("Invalid phone number")
        return v

class OtpVerifyRequest(BaseModel):
    contact: str   # email or phone
    code:    str

class EmailLoginRequest(BaseModel):
    email:    EmailStr
    password: str

class PhoneLoginRequest(BaseModel):
    phone: str

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"

# ─── HELPERS ─────────────────────────────────────────────────────────────────
async def create_user_with_defaults(db: AsyncSession, email=None, phone=None, password=None) -> User:
    """Create user + free subscription + token balance."""
    user = User(
        email=email,
        phone=phone,
        password_hash=hash_password(password) if password else None,
        is_verified=False,
    )
    db.add(user)
    await db.flush()  # get user.id

    # Free plan subscription
    plan_cfg = PLANS[PlanName.free]
    sub = Subscription(
        user_id=user.id,
        plan=PlanName.free,
        photos_used=0,
        photos_limit=plan_cfg["photos"],
    )
    db.add(sub)

    # Token balance
    bal = TokenBalance(user_id=user.id, balance=plan_cfg["tokens"])
    db.add(bal)

    return user

async def issue_tokens(db: AsyncSession, user_id: str) -> TokenResponse:
    """Issue access + refresh tokens, store refresh hash in DB."""
    access  = create_access_token(str(user_id))
    refresh, expires = create_refresh_token(str(user_id))

    rt = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(refresh),
        expires_at=expires,
    )
    db.add(rt)
    return TokenResponse(access_token=access, refresh_token=refresh)

# ─── ROUTES ──────────────────────────────────────────────────────────────────

@router.post("/register/email", status_code=201)
async def register_email(req: EmailRegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == req.email))
    if existing:
        if existing.is_verified:
            raise HTTPException(400, "Email already registered")
        # Unverified — resend code instead of blocking
        user = existing
        user.password_hash = hash_password(req.password)
    else:
        user = await create_user_with_defaults(db, email=req.email, password=req.password)

    code = generate_otp()
    otp  = OtpCode(user_id=user.id, contact=req.email, code=code, expires_at=otp_expires_at())
    db.add(otp)

    await send_email_otp(req.email, code)
    return {"message": "Verification code sent to email", "user_id": str(user.id)}


@router.post("/register/phone", status_code=201)
async def register_phone(req: PhoneRegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.phone == req.phone))
    if existing:
        raise HTTPException(400, "Phone already registered")

    user = await create_user_with_defaults(db, phone=req.phone)

    code = generate_otp()
    otp  = OtpCode(user_id=user.id, contact=req.phone, code=code, expires_at=otp_expires_at())
    db.add(otp)

    await send_sms_otp(req.phone, code)
    return {"message": "Verification code sent via SMS", "user_id": str(user.id)}


@router.post("/verify/email")
async def verify_email(req: OtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    otp = await db.scalar(
        select(OtpCode).where(
            OtpCode.contact == req.contact,
            OtpCode.code    == req.code,
            OtpCode.used    == False,
            OtpCode.expires_at > now,
        )
    )
    if not otp:
        raise HTTPException(400, "Invalid or expired code")

    otp.used = True
    user = await db.get(User, otp.user_id)
    user.is_verified = True

    return await issue_tokens(db, user.id)


@router.post("/verify/phone")
async def verify_phone(req: OtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    otp = await db.scalar(
        select(OtpCode).where(
            OtpCode.contact == req.contact,
            OtpCode.code    == req.code,
            OtpCode.used    == False,
            OtpCode.expires_at > now,
        )
    )
    if not otp:
        raise HTTPException(400, "Invalid or expired code")

    otp.used = True
    user = await db.get(User, otp.user_id)
    user.is_verified = True

    return await issue_tokens(db, user.id)


@router.post("/login/email")
async def login_email(req: EmailLoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == req.email))
    if not user or not user.password_hash:
        raise HTTPException(401, "Invalid credentials")
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_verified:
        raise HTTPException(403, "Email not verified")
    if not user.is_active:
        raise HTTPException(403, "Account suspended")

    return await issue_tokens(db, user.id)


@router.post("/login/phone")
async def login_phone(req: PhoneLoginRequest, db: AsyncSession = Depends(get_db)):
    """Phone login always sends a fresh OTP — no password needed."""
    user = await db.scalar(select(User).where(User.phone == req.phone))
    if not user:
        raise HTTPException(404, "Phone not registered")
    if not user.is_active:
        raise HTTPException(403, "Account suspended")

    code = generate_otp()
    otp  = OtpCode(user_id=user.id, contact=req.phone, code=code, expires_at=otp_expires_at())
    db.add(otp)
    await send_sms_otp(req.phone, code)

    return {"message": "Verification code sent via SMS"}


@router.post("/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    token_hash = hash_token(req.refresh_token)
    rt = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked    == False,
        )
    )
    if not rt:
        raise HTTPException(401, "Refresh token revoked or not found")

    now = datetime.now(timezone.utc)
    if rt.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(401, "Refresh token expired")

    # Rotate: revoke old, issue new
    rt.revoked = True
    return await issue_tokens(db, rt.user_id)


@router.post("/logout")
async def logout(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(req.refresh_token)
    rt = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    if rt:
        rt.revoked = True
    return {"message": "Logged out"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id":          str(current_user.id),
        "email":       current_user.email,
        "phone":       current_user.phone,
        "is_verified": current_user.is_verified,
        "created_at":  current_user.created_at,
    }
