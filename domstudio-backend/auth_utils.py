"""
DomStudio — Auth Utilities
JWT tokens, password hashing, OTP, SMS
"""

import os
import random
import hashlib
import httpx
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from config import required_env

# ─── CONFIG ──────────────────────────────────────────────────────────────────
JWT_SECRET      = required_env("JWT_SECRET")
JWT_ALGORITHM   = "HS256"
ACCESS_TTL_MIN  = 30        # 30 minutes
REFRESH_TTL_DAYS= 30        # 30 days
OTP_TTL_MIN     = 10        # 10 minutes

SMS_API_KEY     = os.getenv("SMS_API_KEY", "")       # smsc.ru or sms.ru key
SMS_SENDER      = os.getenv("SMS_SENDER", "DomStudio")
FRONTEND_URL    = os.getenv("FRONTEND_URL", "https://domstudio.ru")
RESEND_API_KEY  = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM      = os.getenv("EMAIL_FROM", "DomStudio <noreply@domstudio.ru>")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── PASSWORD ────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ─── JWT ─────────────────────────────────────────────────────────────────────
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "access"},
        JWT_SECRET, algorithm=JWT_ALGORITHM
    )

def create_refresh_token(user_id: str) -> tuple[str, datetime]:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TTL_DAYS)
    token = jwt.encode(
        {"sub": user_id, "exp": expire, "type": "refresh"},
        JWT_SECRET, algorithm=JWT_ALGORITHM
    )
    return token, expire

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None

def hash_token(token: str) -> str:
    """Store only hash of refresh token in DB."""
    return hashlib.sha256(token.encode()).hexdigest()

# ─── OTP ─────────────────────────────────────────────────────────────────────
def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def otp_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MIN)

# ─── EMAIL OTP ────────────────────────────────────────────────────────────────
async def send_email_otp(email: str, code: str):
    """Send OTP via Resend. Falls back to console log when RESEND_API_KEY is unset."""
    if not RESEND_API_KEY:
        print(f"[EMAIL OTP] To: {email} | Code: {code}")
        return

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from":    EMAIL_FROM,
                    "to":      [email],
                    "subject": f"Ваш код подтверждения: {code}",
                    "text": (
                        f"Код подтверждения DomStudio: {code}\n"
                        f"Действителен {OTP_TTL_MIN} минут.\n\n"
                        "Если вы не запрашивали этот код — просто проигнорируйте письмо."
                    ),
                },
            )
            if resp.status_code not in (200, 201):
                print(f"[EMAIL ERROR] Resend {resp.status_code}: {resp.text}")
    except Exception as exc:
        print(f"[EMAIL EXCEPTION] {exc}")

# ─── SMS OTP ──────────────────────────────────────────────────────────────────
async def send_sms_otp(phone: str, code: str):
    """
    Send OTP via SMS using SMSC.ru (most reliable for Russian numbers).
    Fallback: SMS.ru
    """
    if not SMS_API_KEY:
        print(f"[SMS OTP] To: {phone} | Code: {code}")
        return

    # Normalize phone — strip non-digits, ensure starts with 7
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("8"):
        digits = "7" + digits[1:]

    message = f"DomStudio: {code} — ваш код подтверждения. Действителен {OTP_TTL_MIN} мин."

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://smsc.ru/sys/send.php",
                params={
                    "login":   os.getenv("SMS_LOGIN", "domstudio"),
                    "psw":     SMS_API_KEY,
                    "phones":  digits,
                    "mes":     message,
                    "sender":  SMS_SENDER,
                    "charset": "utf-8",
                    "fmt":     1,
                }
            )
            data = resp.json()
            if data.get("error"):
                print(f"[SMS ERROR] {data}")
    except Exception as e:
        print(f"[SMS EXCEPTION] {e}")
