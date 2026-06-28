"""Public contact form router."""

import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator


router = APIRouter()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "DomStudio <noreply@domstudio.site>")
CONTACT_TO_EMAIL = os.getenv("CONTACT_TO_EMAIL", "hello@domstudio.site")

ALLOWED_REASONS = {"help", "contact", "careers", "partners"}
REASON_LABELS = {
    "help": "Help",
    "contact": "Contact us",
    "careers": "Careers",
    "partners": "Partnership",
}


class ContactRequest(BaseModel):
    email: EmailStr
    reason: str
    message: str

    @field_validator("reason")
    @classmethod
    def validate_reason(cls, value: str) -> str:
        reason = value.strip().lower()
        if reason not in ALLOWED_REASONS:
            raise ValueError("Unsupported contact reason")
        return reason

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        message = value.strip()
        if len(message) < 10:
            raise ValueError("Message must be at least 10 characters")
        if len(message) > 4000:
            raise ValueError("Message must be 4000 characters or fewer")
        return message


async def send_contact_message(req: ContactRequest) -> None:
    subject = f"DomStudio contact: {REASON_LABELS[req.reason]}"
    text = (
        f"Reason: {REASON_LABELS[req.reason]}\n"
        f"From: {req.email}\n\n"
        f"{req.message}\n"
    )

    if not RESEND_API_KEY:
        print(f"[CONTACT] To: {CONTACT_TO_EMAIL} | {subject}\n{text}")
        return

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": EMAIL_FROM,
                "to": [CONTACT_TO_EMAIL],
                "reply_to": str(req.email),
                "subject": subject,
                "text": text,
            },
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not send contact message")


@router.post("")
async def submit_contact(req: ContactRequest):
    await send_contact_message(req)
    return {"ok": True}
