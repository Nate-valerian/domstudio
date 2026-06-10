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
