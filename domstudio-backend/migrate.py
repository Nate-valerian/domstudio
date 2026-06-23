"""
DomStudio — DB Migration Runner

Usage:
    python migrate.py

Creates all base tables (via SQLAlchemy create_all) then applies any ALTER
migrations in order. Safe to run multiple times on both fresh and existing DBs.
"""

import asyncio
import os
import re

import asyncpg
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# Use regex so special chars in the password don't break urlparse
_m = re.match(
    r"postgresql(?:\+asyncpg)?://([^:]+):(.+)@([^:@/]+)(?::(\d+))?/(.+)",
    DATABASE_URL,
)
if not _m:
    raise ValueError(f"Cannot parse DATABASE_URL: {DATABASE_URL[:30]}…")
_PG_PARAMS = dict(
    user=_m.group(1),
    password=_m.group(2),
    host=_m.group(3),
    port=int(_m.group(4) or 5432),
    database=_m.group(5),
)

# ─── MIGRATIONS ──────────────────────────────────────────────────────────────
# Each entry: (version_id, description, sql)
MIGRATIONS: list[tuple[str, str, str]] = [
    (
        "001",
        "Add pack_id to payments",
        """
        ALTER TABLE payments
            ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);
        """,
    ),
    (
        "002",
        "Create generation_jobs table",
        """
        CREATE TABLE IF NOT EXISTS generation_jobs (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id),
            mode        VARCHAR(50)  NOT NULL,
            subject     VARCHAR(500) NOT NULL,
            status      VARCHAR(20)  NOT NULL DEFAULT 'queued',
            output_url  VARCHAR(1000),
            tokens_used INTEGER      NOT NULL DEFAULT 100,
            created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ix_generation_jobs_user_id
            ON generation_jobs (user_id);
        """,
    ),
    (
        "003",
        "Make payments.plan nullable (no-op if already nullable)",
        """
        ALTER TABLE payments
            ALTER COLUMN plan DROP NOT NULL;
        """,
    ),
    (
        "004",
        "Add video media fields to generation_jobs",
        """
        ALTER TABLE generation_jobs
            ADD COLUMN IF NOT EXISTS output_data TEXT,
            ADD COLUMN IF NOT EXISTS output_format VARCHAR(30),
            ADD COLUMN IF NOT EXISTS error TEXT;
        """,
    ),
    (
        "005",
        "Add subscription video quotas",
        """
        ALTER TABLE subscriptions
            ADD COLUMN IF NOT EXISTS videos_used INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS videos_limit INTEGER NOT NULL DEFAULT 5,
            ADD COLUMN IF NOT EXISTS premium_videos_used INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS premium_videos_limit INTEGER NOT NULL DEFAULT 0;

        UPDATE subscriptions
        SET
            videos_limit = CASE plan
                WHEN 'basic' THEN 30
                WHEN 'pro' THEN 50
                WHEN 'business' THEN 100
                ELSE 5
            END,
            premium_videos_limit = CASE plan
                WHEN 'basic' THEN 10
                WHEN 'pro' THEN 33
                WHEN 'business' THEN 99
                ELSE 0
            END;
        """,
    ),
    (
        "006",
        "Create marketplace AdPilot tables",
        """
        CREATE TABLE IF NOT EXISTS marketplace_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            provider VARCHAR(30) NOT NULL,
            display_name VARCHAR(120),
            status VARCHAR(30) NOT NULL DEFAULT 'draft',
            mode VARCHAR(20) NOT NULL DEFAULT 'draft',
            api_token_enc TEXT,
            client_id_enc TEXT,
            extra_config TEXT,
            scopes TEXT,
            last_sync_at TIMESTAMPTZ,
            last_error TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ix_marketplace_connections_user_id
            ON marketplace_connections (user_id);

        CREATE TABLE IF NOT EXISTS marketplace_products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            connection_id UUID REFERENCES marketplace_connections(id),
            provider VARCHAR(30) NOT NULL,
            external_product_id VARCHAR(255),
            title VARCHAR(500) NOT NULL,
            sku VARCHAR(255),
            category VARCHAR(255),
            price VARCHAR(120),
            stock INTEGER,
            image_url VARCHAR(1000),
            description TEXT,
            raw_payload TEXT,
            last_synced_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ix_marketplace_products_user_id
            ON marketplace_products (user_id);
        CREATE INDEX IF NOT EXISTS ix_marketplace_products_connection_id
            ON marketplace_products (connection_id);
        CREATE INDEX IF NOT EXISTS ix_marketplace_products_external_product_id
            ON marketplace_products (external_product_id);

        CREATE TABLE IF NOT EXISTS adpilot_actions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            connection_id UUID REFERENCES marketplace_connections(id),
            product_id UUID REFERENCES marketplace_products(id),
            provider VARCHAR(30) NOT NULL,
            action_type VARCHAR(80) NOT NULL,
            title VARCHAR(255) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'draft',
            draft_payload TEXT NOT NULL,
            publish_payload TEXT,
            result_payload TEXT,
            approval_required BOOLEAN NOT NULL DEFAULT TRUE,
            source VARCHAR(80) NOT NULL DEFAULT 'manual',
            error TEXT,
            approved_at TIMESTAMPTZ,
            published_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ix_adpilot_actions_user_id
            ON adpilot_actions (user_id);
        CREATE INDEX IF NOT EXISTS ix_adpilot_actions_connection_id
            ON adpilot_actions (connection_id);
        CREATE INDEX IF NOT EXISTS ix_adpilot_actions_product_id
            ON adpilot_actions (product_id);

        CREATE TABLE IF NOT EXISTS adpilot_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            connection_id UUID REFERENCES marketplace_connections(id),
            provider VARCHAR(30) NOT NULL,
            name VARCHAR(160) NOT NULL,
            trigger_type VARCHAR(80) NOT NULL,
            action_type VARCHAR(80) NOT NULL,
            conditions TEXT,
            enabled BOOLEAN NOT NULL DEFAULT TRUE,
            approval_required BOOLEAN NOT NULL DEFAULT TRUE,
            last_run_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ix_adpilot_rules_user_id
            ON adpilot_rules (user_id);
        CREATE INDEX IF NOT EXISTS ix_adpilot_rules_connection_id
            ON adpilot_rules (connection_id);
        """,
    ),
    (
        "007",
        "Add referral_code and referred_by_code to users",
        """
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS referral_code VARCHAR(16),
            ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(16);

        CREATE UNIQUE INDEX IF NOT EXISTS ix_users_referral_code
            ON users (referral_code)
            WHERE referral_code IS NOT NULL;

        UPDATE users
        SET referral_code = UPPER(LEFT(REPLACE(gen_random_uuid()::TEXT, '-', ''), 8))
        WHERE referral_code IS NULL;
        """,
    ),
]


async def run():
    # Create all base tables from SQLAlchemy models (safe no-op if they exist)
    from database import Base
    sa_url = DATABASE_URL if DATABASE_URL.startswith("postgresql+asyncpg") \
        else DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    _engine = create_async_engine(sa_url, echo=False)
    async with _engine.begin() as _conn:
        await _conn.run_sync(Base.metadata.create_all)
    await _engine.dispose()
    print("Base tables ensured.")

    conn = await asyncpg.connect(**_PG_PARAMS)
    try:
        # Ensure tracking table exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version     VARCHAR(10) PRIMARY KEY,
                description TEXT,
                applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)

        rows = await conn.fetch("SELECT version FROM schema_migrations")
        applied = {row["version"] for row in rows}

        for version, description, sql in MIGRATIONS:
            if version in applied:
                print(f"  [skip] {version} — {description}")
                continue

            print(f"  [apply] {version} — {description}")
            async with conn.transaction():
                await conn.execute(sql)
                await conn.execute(
                    "INSERT INTO schema_migrations (version, description) VALUES ($1, $2)",
                    version, description,
                )

        print("Migrations complete.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run())
