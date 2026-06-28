"""Shared CORS origin configuration."""

from __future__ import annotations

import os


DEFAULT_CORS_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://domstudio.vercel.app",
    "http://domstudio.site",
    "https://domstudio.site",
    "http://www.domstudio.site",
    "https://www.domstudio.site",
}


def env_cors_origins() -> list[str]:
    return [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]


def effective_cors_origins() -> list[str]:
    return sorted(DEFAULT_CORS_ORIGINS | set(env_cors_origins()))
