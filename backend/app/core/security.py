from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def _get_jwt_secret() -> str:
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET is not configured")
    return settings.jwt_secret


def create_access_token(
    *,
    subject: str,
    merchant_id: str,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    now = datetime.now(timezone.utc)

    expires_at = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.access_token_expire_minutes)
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "merchant_id": merchant_id,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        _get_jwt_secret(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    payload = jwt.decode(
        token,
        _get_jwt_secret(),
        algorithms=[settings.jwt_algorithm],
    )

    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Invalid token type")

    return payload
