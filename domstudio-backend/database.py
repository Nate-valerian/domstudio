"""
DomStudio — Database Models
SQLAlchemy async ORM
"""

import os

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

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "prepared_statement_cache_size": 0,
        "timeout": float(os.getenv("DB_CONNECT_TIMEOUT_SECONDS", "10")),
        "command_timeout": float(os.getenv("DB_COMMAND_TIMEOUT_SECONDS", "20")),
    },
)
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

class MarketplaceProvider(str, enum.Enum):
    wildberries = "wildberries"
    ozon        = "ozon"
    avito       = "avito"

class MarketplaceConnectionStatus(str, enum.Enum):
    draft       = "draft"
    connected   = "connected"
    error       = "error"
    disabled    = "disabled"

class AdPilotActionStatus(str, enum.Enum):
    draft      = "draft"
    approved   = "approved"
    publishing = "publishing"
    synced     = "synced"
    failed     = "failed"
    skipped    = "skipped"

# ─── PLANS CONFIG ────────────────────────────────────────────────────────────
PLANS = {
    PlanName.free:     {"price_rub": 0,      "photos": 5,   "videos": 5,   "premium_videos": 0,  "tokens": 500},
    PlanName.basic:    {"price_rub": 270,    "photos": 30,  "videos": 30,  "premium_videos": 10, "tokens": 3000},
    PlanName.pro:      {"price_rub": 790,    "photos": 100, "videos": 50,  "premium_videos": 33, "tokens": 10000},
    PlanName.business: {"price_rub": 1490,   "photos": 300, "videos": 100, "premium_videos": 99, "tokens": 30000},
}

# ─── TOKEN TOP-UP PACKS ──────────────────────────────────────────────────────
TOKEN_PACKS = {
    "pack_500":  {"tokens": 500,  "price_rub": 99,  "label": "500 токенов"},
    "pack_1500": {"tokens": 1500, "price_rub": 249, "label": "1 500 токенов"},
    "pack_5000": {"tokens": 5000, "price_rub": 699, "label": "5 000 токенов"},
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
    marketplace_connections = relationship("MarketplaceConnection", back_populates="user")
    marketplace_products = relationship("MarketplaceProduct", back_populates="user")
    adpilot_actions = relationship("AdPilotAction", back_populates="user")
    adpilot_rules = relationship("AdPilotRule", back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    plan         = Column(Enum(PlanName, native_enum=False), default=PlanName.free)
    photos_used  = Column(Integer, default=0)
    photos_limit = Column(Integer, default=5)
    videos_used  = Column(Integer, default=0)
    videos_limit = Column(Integer, default=5)
    premium_videos_used  = Column(Integer, default=0)
    premium_videos_limit = Column(Integer, default=0)
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
    provider         = Column(Enum(PaymentProvider, native_enum=False))
    provider_order_id= Column(String(255), unique=True, index=True)  # Tinkoff PaymentId
    amount_rub       = Column(Float)
    plan             = Column(Enum(PlanName, native_enum=False), nullable=True)
    pack_id          = Column(String(50),  nullable=True)
    status           = Column(Enum(PaymentStatus, native_enum=False), default=PaymentStatus.pending)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="payments")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    mode       = Column(String(50))
    subject    = Column(String(500))
    status     = Column(Enum(JobStatus, native_enum=False), default=JobStatus.queued)
    output_url = Column(String(1000), nullable=True)
    output_data= Column(Text, nullable=True)
    output_format = Column(String(30), nullable=True)
    error      = Column(Text, nullable=True)
    tokens_used= Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="jobs")


class MarketplaceConnection(Base):
    __tablename__ = "marketplace_connections"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    provider        = Column(Enum(MarketplaceProvider, native_enum=False), nullable=False)
    display_name    = Column(String(120), nullable=True)
    status          = Column(Enum(MarketplaceConnectionStatus, native_enum=False), default=MarketplaceConnectionStatus.draft)
    mode            = Column(String(20), default="draft")  # draft or live
    api_token_enc   = Column(Text, nullable=True)
    client_id_enc   = Column(Text, nullable=True)
    extra_config    = Column(Text, nullable=True)
    scopes          = Column(Text, nullable=True)
    last_sync_at    = Column(DateTime(timezone=True), nullable=True)
    last_error      = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="marketplace_connections")
    products = relationship("MarketplaceProduct", back_populates="connection")
    actions = relationship("AdPilotAction", back_populates="connection")
    rules = relationship("AdPilotRule", back_populates="connection")


class MarketplaceProduct(Base):
    __tablename__ = "marketplace_products"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id             = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    connection_id       = Column(UUID(as_uuid=True), ForeignKey("marketplace_connections.id"), nullable=True, index=True)
    provider            = Column(Enum(MarketplaceProvider, native_enum=False), nullable=False)
    external_product_id = Column(String(255), nullable=True, index=True)
    title               = Column(String(500), nullable=False)
    sku                 = Column(String(255), nullable=True)
    category            = Column(String(255), nullable=True)
    price               = Column(String(120), nullable=True)
    stock               = Column(Integer, nullable=True)
    image_url           = Column(String(1000), nullable=True)
    description         = Column(Text, nullable=True)
    raw_payload         = Column(Text, nullable=True)
    last_synced_at      = Column(DateTime(timezone=True), nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="marketplace_products")
    connection = relationship("MarketplaceConnection", back_populates="products")
    actions = relationship("AdPilotAction", back_populates="product")


class AdPilotAction(Base):
    __tablename__ = "adpilot_actions"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    connection_id   = Column(UUID(as_uuid=True), ForeignKey("marketplace_connections.id"), nullable=True, index=True)
    product_id      = Column(UUID(as_uuid=True), ForeignKey("marketplace_products.id"), nullable=True, index=True)
    provider        = Column(Enum(MarketplaceProvider, native_enum=False), nullable=False)
    action_type     = Column(String(80), nullable=False)
    title           = Column(String(255), nullable=False)
    status          = Column(Enum(AdPilotActionStatus, native_enum=False), default=AdPilotActionStatus.draft)
    draft_payload   = Column(Text, nullable=False)
    publish_payload = Column(Text, nullable=True)
    result_payload  = Column(Text, nullable=True)
    approval_required = Column(Boolean, default=True)
    source          = Column(String(80), default="manual")
    error           = Column(Text, nullable=True)
    approved_at     = Column(DateTime(timezone=True), nullable=True)
    published_at    = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="adpilot_actions")
    connection = relationship("MarketplaceConnection", back_populates="actions")
    product = relationship("MarketplaceProduct", back_populates="actions")


class AdPilotRule(Base):
    __tablename__ = "adpilot_rules"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    connection_id   = Column(UUID(as_uuid=True), ForeignKey("marketplace_connections.id"), nullable=True, index=True)
    provider        = Column(Enum(MarketplaceProvider, native_enum=False), nullable=False)
    name            = Column(String(160), nullable=False)
    trigger_type    = Column(String(80), nullable=False)
    action_type     = Column(String(80), nullable=False)
    conditions      = Column(Text, nullable=True)
    enabled         = Column(Boolean, default=True)
    approval_required = Column(Boolean, default=True)
    last_run_at     = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="adpilot_rules")
    connection = relationship("MarketplaceConnection", back_populates="rules")


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
