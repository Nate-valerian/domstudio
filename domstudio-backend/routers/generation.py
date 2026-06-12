"""
DomStudio — Generation Router
POST /generation/generate      — synchronous image generation (deducts 100 tokens)
POST /generation/video         — async video job (deducts 300 tokens, returns job_id)
GET  /generation/jobs          — list user's recent jobs
GET  /generation/jobs/{job_id} — poll a single job by id
"""

import asyncio
import base64
import io
import os

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal, GenerationJob, JobStatus, Subscription, TokenBalance, User, get_db
from dependencies import get_current_user
from services.comfy_client import generate_image_with_comfy


router = APIRouter()
GENERATION_API_URL    = os.getenv("GENERATION_API_URL", "http://localhost:8001").rstrip("/")
GENERATION_PROVIDER   = os.getenv("GENERATION_PROVIDER", "worker").lower()
IMAGE_TOKEN_COST      = 100
VIDEO_TOKEN_COST      = 300
GENERATION_TOKEN_COST = IMAGE_TOKEN_COST


# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    mode:       str   = "catalog"
    subject:    str   = Field(min_length=1, max_length=500)
    image:      str | None = None
    style_hint: str   = Field(default="", max_length=500)
    seed:       int   = -1
    upscale_4k: bool  = False


class VideoRequest(BaseModel):
    mode:       str  = "lifestyle"
    subject:    str  = Field(min_length=1, max_length=500)
    image:      str | None = None
    duration_s: int  = Field(default=3, ge=2, le=10)


# ─── HELPERS ──────────────────────────────────────────────────────────────────

async def change_balance(db: AsyncSession, user_id, amount: int, require_balance: bool = False):
    conditions = [TokenBalance.user_id == user_id]
    if require_balance:
        conditions.append(TokenBalance.balance >= -amount)

    result = await db.execute(
        update(TokenBalance)
        .where(*conditions)
        .values(balance=TokenBalance.balance + amount)
        .returning(TokenBalance.balance)
    )
    return result.scalar_one_or_none()


async def increment_photos_used(db: AsyncSession, user_id) -> None:
    await db.execute(
        update(Subscription)
        .where(Subscription.user_id == user_id)
        .values(photos_used=Subscription.photos_used + 1)
    )


def _image_dimensions(b64: str) -> tuple[int, int]:
    """Decode base64 image and return (width, height). Returns (0,0) on failure."""
    try:
        from PIL import Image
        data = base64.b64decode(b64)
        img = Image.open(io.BytesIO(data))
        return img.width, img.height
    except Exception:
        return 0, 0


# ─── IMAGE GENERATION (synchronous) ───────────────────────────────────────────

@router.post("/generate")
async def generate(
    req: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    balance = await change_balance(db, current_user.id, -IMAGE_TOKEN_COST, require_balance=True)
    if balance is None:
        raise HTTPException(402, "Insufficient tokens")

    try:
        if GENERATION_PROVIDER == "comfy":
            result = await generate_image_with_comfy(req)
        else:
            async with httpx.AsyncClient(timeout=600) as client:
                response = await client.post(
                    f"{GENERATION_API_URL}/generate",
                    json=req.model_dump(),
                )
                response.raise_for_status()
                result = response.json()

        if result.get("status") != "success":
            raise RuntimeError(result.get("error") or "Generation worker failed")
    except Exception as exc:
        await change_balance(db, current_user.id, IMAGE_TOKEN_COST)
        raise HTTPException(502, f"Generation failed: {exc}") from exc

    await increment_photos_used(db, current_user.id)

    w, h = _image_dimensions(result.get("image", ""))

    return {
        **result,
        "width":          w or None,
        "height":         h or None,
        "tokens_charged": IMAGE_TOKEN_COST,
        "token_balance":  balance,
    }


# ─── VIDEO GENERATION (async job) ─────────────────────────────────────────────

@router.post("/video")
async def generate_video(
    req: VideoRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    balance = await change_balance(db, current_user.id, -VIDEO_TOKEN_COST, require_balance=True)
    if balance is None:
        raise HTTPException(402, "Insufficient tokens")

    job = GenerationJob(
        user_id=current_user.id,
        mode=req.mode,
        subject=req.subject,
        status=JobStatus.queued,
        tokens_used=VIDEO_TOKEN_COST,
    )
    db.add(job)
    await db.flush()
    job_id = str(job.id)

    background_tasks.add_task(_run_video_job, job_id, req)

    return {
        "job_id":          job_id,
        "status":          "queued",
        "tokens_charged":  VIDEO_TOKEN_COST,
        "token_balance":   balance,
    }


async def _run_video_job(job_id: str, req: VideoRequest) -> None:
    """Background worker — runs the video generation and updates job status."""
    async with AsyncSessionLocal() as db:
        job = await db.get(GenerationJob, job_id)
        if not job:
            return
        job.status = JobStatus.processing
        await db.commit()

    try:
        # TODO: replace with real ComfyUI image-to-video workflow call
        # e.g. result = await generate_video_with_comfy(req)
        await asyncio.sleep(5)   # stub — simulates processing time
        output_url = None        # will be an S3/CDN URL when workflow is wired

        async with AsyncSessionLocal() as db:
            job = await db.get(GenerationJob, job_id)
            if job:
                job.status     = JobStatus.done
                job.output_url = output_url
                await db.commit()

    except Exception:
        async with AsyncSessionLocal() as db:
            job = await db.get(GenerationJob, job_id)
            if job:
                job.status = JobStatus.failed
                await db.commit()

        # Refund tokens on failure
        async with AsyncSessionLocal() as db:
            job = await db.get(GenerationJob, job_id)
            if job:
                await change_balance(db, job.user_id, VIDEO_TOKEN_COST)
                await db.commit()


# ─── JOB POLLING ──────────────────────────────────────────────────────────────

@router.get("/jobs")
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(GenerationJob)
        .where(GenerationJob.user_id == current_user.id)
        .order_by(GenerationJob.created_at.desc())
        .limit(20)
    )
    return [
        {
            "job_id":      str(j.id),
            "status":      j.status,
            "mode":        j.mode,
            "subject":     j.subject,
            "output_url":  j.output_url,
            "tokens_used": j.tokens_used,
            "created_at":  j.created_at,
        }
        for j in result.scalars().all()
    ]


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = await db.get(GenerationJob, job_id)
    if not job or str(job.user_id) != str(current_user.id):
        raise HTTPException(404, "Job not found")
    return {
        "job_id":      str(job.id),
        "status":      job.status,
        "mode":        job.mode,
        "subject":     job.subject,
        "output_url":  job.output_url,
        "tokens_used": job.tokens_used,
        "created_at":  job.created_at,
    }
