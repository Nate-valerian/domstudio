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
import logging
import os

from database import engine, Base
from routers import auth, generation, users, payments, subscriptions, tokens

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("domstudio")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Database tables ready")
    yield

app = FastAPI(
    title="DomStudio API",
    version="1.0.0",
    description="Auth, payments and subscription management for DomStudio",
    lifespan=lifespan,
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

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

@app.get("/health")
def health():
    return {"status": "ok", "service": "domstudio-api", "v": 3}
