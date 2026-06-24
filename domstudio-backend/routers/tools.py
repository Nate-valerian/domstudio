"""
DomStudio — Quick Tools Router
POST /tools/remove-bg  — remove image background, return transparent PNG (free, no tokens)
"""

import io
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response

from database import User
from dependencies import get_current_user

log = logging.getLogger("domstudio")
router = APIRouter()

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB

_rembg_session = None


def _get_session():
    global _rembg_session
    if _rembg_session is None:
        try:
            from rembg import new_session
            _rembg_session = new_session("u2netp")
            log.info("rembg u2netp session initialised")
        except Exception as exc:
            log.error("rembg session init failed: %s", exc)
            raise HTTPException(503, "Background removal unavailable") from exc
    return _rembg_session


@router.post("/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "File must be an image")

    data = await file.read()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(400, "File too large (max 10 MB)")

    try:
        from rembg import remove as rembg_remove
        session = _get_session()
        result = rembg_remove(data, session=session)
    except HTTPException:
        raise
    except Exception as exc:
        log.exception("remove-bg failed")
        raise HTTPException(500, f"Background removal failed: {exc}") from exc

    return Response(
        content=result,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="no-bg.png"'},
    )
