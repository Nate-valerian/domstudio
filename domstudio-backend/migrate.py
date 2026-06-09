"""
DomStudio — DB Migration Runner

Usage:
    python migrate.py

Applies all unapplied migrations in order. Safe to run multiple times.
Uses a `schema_migrations` table to track applied versions.

For fresh installs this is unnecessary — main.py runs create_all on startup.
Only needed when deploying schema changes to an existing database.
"""

import asyncio
import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# asyncpg wants postgresql:// not postgresql+asyncpg://
PG_DSN = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

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
    conn = await asyncpg.connect(PG_DSN)
    try:
        # Ensure tracking table exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version     VARCHAR(10) PRIMARY KEY,
                description TEXT,
                applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)

        applied = {row["version"] async for row in conn.cursor(
            "SELECT version FROM schema_migrations"
        )}

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
