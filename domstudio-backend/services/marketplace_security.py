"""Small helpers for protecting marketplace credentials at rest."""

from __future__ import annotations

import base64
import hashlib
import os

from cryptography.fernet import Fernet, InvalidToken

from auth_utils import JWT_SECRET


def _fernet() -> Fernet:
    raw = os.getenv("MARKETPLACE_ENCRYPTION_KEY") or JWT_SECRET
    digest = hashlib.sha256(raw.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(value: str | None) -> str | None:
    if not value:
        return None
    return _fernet().encrypt(value.encode("utf-8")).decode("ascii")


def decrypt_secret(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return _fernet().decrypt(value.encode("ascii")).decode("utf-8")
    except InvalidToken:
        return None
