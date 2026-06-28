"""Safe runtime observability helpers for deployed environments."""

from __future__ import annotations

import os
import platform
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

from cors_config import effective_cors_origins, env_cors_origins


BASE_DIR = Path(__file__).resolve().parent
REPO_DIR = BASE_DIR.parent


def _short(value: str | None, length: int = 12) -> str | None:
    text = str(value or "").strip()
    if not text:
        return None
    return text[:length]


def _git_commit() -> str | None:
    env_commit = (
        os.getenv("APP_COMMIT")
        or os.getenv("GIT_COMMIT")
        or os.getenv("SOURCE_VERSION")
        or os.getenv("RAILWAY_GIT_COMMIT_SHA")
        or os.getenv("RENDER_GIT_COMMIT")
        or os.getenv("VERCEL_GIT_COMMIT_SHA")
    )
    if env_commit:
        return _short(env_commit)

    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short=12", "HEAD"],
            cwd=REPO_DIR,
            check=True,
            capture_output=True,
            text=True,
            timeout=2,
        )
        return _short(result.stdout)
    except Exception:
        return None


def _git_branch() -> str | None:
    env_branch = (
        os.getenv("APP_BRANCH")
        or os.getenv("GIT_BRANCH")
        or os.getenv("RAILWAY_GIT_BRANCH")
        or os.getenv("RENDER_GIT_BRANCH")
        or os.getenv("VERCEL_GIT_COMMIT_REF")
    )
    if env_branch:
        return env_branch.strip()

    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=REPO_DIR,
            check=True,
            capture_output=True,
            text=True,
            timeout=2,
        )
        branch = result.stdout.strip()
        return branch or None
    except Exception:
        return None


def _safe_url_host(value: str | None) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    parsed = urlsplit(raw if "://" in raw else f"https://{raw}")
    return parsed.hostname


def _env_present(name: str) -> bool:
    return bool(os.getenv(name, "").strip())


def _csv_values(name: str) -> list[str]:
    return [
        item.strip()
        for item in os.getenv(name, "").split(",")
        if item.strip()
    ]


def _workflow_status(filename: str | None) -> dict[str, object]:
    workflow_dir = Path(os.getenv("COMFYUI_WORKFLOW_DIR", str(BASE_DIR / "workflows")))
    name = str(filename or "").strip()
    path = workflow_dir / name if name else workflow_dir
    return {
        "file": name or None,
        "exists": path.exists() if name else False,
    }


def runtime_version_payload() -> dict[str, object]:
    image_workflow = os.getenv("COMFYUI_IMAGE_WORKFLOW", "product_image.json")
    video_workflow = os.getenv("COMFYUI_VIDEO_WORKFLOW", "product_video_wan_local.json")
    premium_video_workflow = os.getenv("COMFYUI_PREMIUM_VIDEO_WORKFLOW", "product_video.json")

    return {
        "service": "domstudio-api",
        "status": "ok",
        "commit": _git_commit(),
        "branch": _git_branch(),
        "python": platform.python_version(),
        "cwd": str(Path.cwd()),
        "generation": {
            "provider": os.getenv("GENERATION_PROVIDER", "worker").lower(),
            "worker_url_host": _safe_url_host(os.getenv("GENERATION_API_URL")),
        },
        "cors": {
            "env_origins": env_cors_origins(),
            "effective_origins": effective_cors_origins(),
        },
        "comfy": {
            "url_host": _safe_url_host(os.getenv("COMFYUI_URL")),
            "port": os.getenv("COMFYUI_PORT", "6006"),
            "api_key_present": _env_present("COMFYUI_API_KEY"),
            "account_api_key_present": _env_present("COMFYUI_ACCOUNT_API_KEY"),
            "allow_paid_partner_nodes": os.getenv("COMFYUI_ALLOW_PAID_PARTNER_NODES", "").strip().lower()
            in {"1", "true", "yes", "on"},
            "video_resolution": os.getenv("COMFYUI_VIDEO_RESOLUTION", "720p"),
            "poll_timeout": os.getenv("COMFYUI_POLL_TIMEOUT", "600"),
        },
        "text_ai": {
            "base_url_host": _safe_url_host(os.getenv("TEXT_AI_BASE_URL")),
            "model": os.getenv("TEXT_AI_MODEL") or None,
            "api_key_present": _env_present("TEXT_AI_API_KEY"),
            "timeout_ms": os.getenv("TEXT_AI_TIMEOUT_MS", "60000"),
            "content_token_unit": os.getenv("CONTENT_TOKEN_UNIT", "10"),
        },
        "workflows": {
            "image": _workflow_status(image_workflow),
            "video": _workflow_status(video_workflow),
            "premium_video": _workflow_status(premium_video_workflow),
        },
        "integrations": {
            "database_url_present": _env_present("DATABASE_URL"),
            "deepseek_api_key_present": _env_present("DEEPSEEK_API_KEY"),
            "resend_api_key_present": _env_present("RESEND_API_KEY"),
            "sms_api_key_present": _env_present("SMS_API_KEY"),
        },
    }
