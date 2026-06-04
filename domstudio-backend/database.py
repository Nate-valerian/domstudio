"""
DomStudio — Database Models
SQLAlchemy async ORM
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from config import required_env

DATABASE_URL = required_env("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# ─── ENUMS ──────────────────────────────────────────────────────────────────
class PlanName(str, enum.Enum):
    free     = "free"
    basic    = "basic"
    pro      = "pro"
    business = "business"
    agency   = "agency"

class PaymentStatus(str, enum.Enum):
    pending   = "pending"
    succeeded = "succeeded"
    failed    = "failed"
    refunded  = "refunded"

class PaymentProvider(str, enum.Enum):
    tinkoff    = "tinkoff"
    yandex_pay = "yandex_pay"

class JobStatus(str, enum.Enum):
    queued     = "queued"
    processing = "processing"
    done       = "done"
    failed     = "failed"

# ─── PLANS CONFIG ────────────────────────────────────────────────────────────
PLANS = {
    PlanName.free:     {"price_rub": 0,      "photos": 5,   "tokens": 500},
    PlanName.basic:    {"price_rub": 1750,   "photos": 25,  "tokens": 2500},
    PlanName.pro:      {"price_rub": 3750,   "photos": 60,  "tokens": 6000},
    PlanName.business: {"price_rub": 8250,   "photos": 150, "tokens": 15000},
    PlanName.agency:   {"price_rub": 17500,  "photos": 400, "tokens": 40000},
}

# ─── MODELS ──────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String(255), unique=True, nullable=True, index=True)
    phone         = Column(String(20),  unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    is_verified   = Column(Boolean, default=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    subscription  = relationship("Subscription", back_populates="user", uselist=False)
    token_balance = relationship("TokenBalance",  back_populates="user", uselist=False)
    payments      = relationship("Payment",       back_populates="user")
    jobs          = relationship("GenerationJob", back_populates="user")
    otp_codes     = relationship("OtpCode",       back_populates="user")
    refresh_tokens= relationship("RefreshToken",  back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    plan         = Column(Enum(PlanName), default=PlanName.free)
    photos_used  = Column(Integer, default=0)
    photos_limit = Column(Integer, default=5)
    renews_at    = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscription")


class TokenBalance(Base):
    __tablename__ = "token_balances"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    balance    = Column(Integer, default=500)   # free tier starts with 500
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="token_balance")


class Payment(Base):
    __tablename__ = "payments"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    provider         = Column(Enum(PaymentProvider))
    provider_order_id= Column(String(255), unique=True, index=True)  # Tinkoff PaymentId
    amount_rub       = Column(Float)
    plan             = Column(Enum(PlanName))
    status           = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="payments")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    mode       = Column(String(50))
    subject    = Column(String(500))
    status     = Column(Enum(JobStatus), default=JobStatus.queued)
    output_url = Column(String(1000), nullable=True)
    tokens_used= Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="jobs")


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    contact    = Column(String(255))   # email or phone
    code       = Column(String(6))
    used       = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="otp_codes")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    token_hash = Column(String(255), unique=True, index=True)
    expires_at = Column(DateTime(timezone=True))
    revoked    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


# ─── DB DEPENDENCY ───────────────────────────────────────────────────────────
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
