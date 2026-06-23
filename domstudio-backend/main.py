"""
DomStudio — Auth + Payments Backend
FastAPI + PostgreSQL + JWT + Tinkoff + Yandex Pay

Run:
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Env vars required (see .env.example):
  DATABASE_URL, JWT_SECRET, TINKOFF_TERMINAL_KEY, TINKOFF_SECRET_KEY,
  YANDEX_PAY_MERCHANT_ID, YANDEX_PAY_SECRET, SMS_API_KEY, FRONTEND_URL
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
import os

from database import engine, Base
from routers import auth, content, generation, marketplaces, users, payments, subscriptions, tokens
from runtime_info import runtime_version_payload

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("domstudio")

def env_float(name: str, default: str) -> float:
    try:
        return float(os.getenv(name) or default)
    except (TypeError, ValueError):
        return float(default)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async def prepare_database():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.exec_driver_sql("""
                ALTER TABLE generation_jobs
                    ADD COLUMN IF NOT EXISTS output_data TEXT,
                    ADD COLUMN IF NOT EXISTS output_format VARCHAR(30),
                    ADD COLUMN IF NOT EXISTS error TEXT;
            """)

    try:
        await asyncio.wait_for(prepare_database(), timeout=env_float("DB_STARTUP_TIMEOUT_SECONDS", "15"))
        log.info("Database tables ready")
    except Exception:
        log.exception("Database startup preparation failed; API will start and DB-backed routes may fail")
    yield

app = FastAPI(
    title="DomStudio API",
    version="1.0.0",
    description="Auth, payments and subscription management for DomStudio",
    lifespan=lifespan,
)

DEFAULT_CORS_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://domstudio.vercel.app",
    "https://domstudio.site",
    "https://www.domstudio.site",
}

cors_origins = sorted(
    DEFAULT_CORS_ORIGINS
    | {
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
app.include_router(users.router,         prefix="/users",         tags=["Users"])
app.include_router(payments.router,      prefix="/payments",      tags=["Payments"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
app.include_router(tokens.router,        prefix="/tokens",        tags=["Tokens"])
app.include_router(generation.router,    prefix="/generation",    tags=["Generation"])
app.include_router(content.router,       prefix="/content",       tags=["Content"])
app.include_router(marketplaces.router,  prefix="/marketplaces",  tags=["Marketplaces"])

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "domstudio-api",
        "v": 8,
        "prompt_version": "preserve-label-image-edit-2026-06-17",
    }


@app.get("/version")
def version():
    return runtime_version_payload()
