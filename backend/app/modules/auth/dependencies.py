from collections.abc import Callable
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.models import Merchant, User
from app.db.session import get_db


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_error

    if credentials.scheme.lower() != "bearer":
        raise credentials_error

    try:
        payload = decode_access_token(credentials.credentials)

        user_id = UUID(str(payload["sub"]))
        merchant_id = UUID(str(payload["merchant_id"]))

    except (
        jwt.InvalidTokenError,
        KeyError,
        TypeError,
        ValueError,
    ):
        raise credentials_error from None

    user = db.scalar(
        select(User).where(
            User.id == user_id,
            User.merchant_id == merchant_id,
            User.is_active.is_(True),
        )
    )

    if user is None:
        raise credentials_error

    merchant = db.scalar(
        select(Merchant).where(
            Merchant.id == merchant_id,
            Merchant.is_active.is_(True),
        )
    )

    if merchant is None:
        raise credentials_error

    return user


def require_roles(*allowed_roles: str) -> Callable[..., User]:
    if not allowed_roles:
        raise ValueError("At least one allowed role is required")

    normalized_roles = {
        role.strip().upper()
        for role in allowed_roles
    }

    def role_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role.upper() not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_dependency


require_admin = require_roles("ADMIN")
require_analyst_or_admin = require_roles("ANALYST", "ADMIN")
