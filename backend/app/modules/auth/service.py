from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.models import Merchant, User
from app.modules.auth.schemas import AuthUser, LoginRequest, LoginResponse


class InvalidCredentialsError(Exception):
    """Raised when login credentials cannot be authenticated."""


def authenticate_user(
    db: Session,
    credentials: LoginRequest,
) -> LoginResponse:
    merchant_slug = credentials.merchant_slug.strip().lower()
    email = str(credentials.email).strip().lower()

    merchant = db.scalar(
        select(Merchant).where(
            Merchant.slug == merchant_slug,
            Merchant.is_active.is_(True),
        )
    )

    if merchant is None:
        raise InvalidCredentialsError

    user = db.scalar(
        select(User).where(
            User.merchant_id == merchant.id,
            User.email == email,
            User.is_active.is_(True),
        )
    )

    if user is None:
        raise InvalidCredentialsError

    if not verify_password(credentials.password, user.password_hash):
        raise InvalidCredentialsError

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=str(user.id),
        merchant_id=str(user.merchant_id),
        role=user.role,
    )

    return LoginResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=AuthUser(
            id=str(user.id),
            merchant_id=str(user.merchant_id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )
