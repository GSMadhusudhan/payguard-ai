from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.models import Merchant, User
from app.modules.auth.schemas import (
    AuthUser,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)


class InvalidCredentialsError(Exception):
    """Raised when login credentials cannot be authenticated."""


class RegistrationConflictError(Exception):
    """Raised when a workspace cannot be registered."""


def authenticate_user(
    db: Session,
    credentials: LoginRequest,
) -> LoginResponse:
    merchant_slug = (
        credentials.merchant_slug
        .strip()
        .lower()
    )

    email = (
        str(credentials.email)
        .strip()
        .lower()
    )

    merchant = db.scalar(
        select(Merchant).where(
            Merchant.slug
            == merchant_slug,
            Merchant.is_active.is_(
                True,
            ),
        )
    )

    if merchant is None:
        raise InvalidCredentialsError

    user = db.scalar(
        select(User).where(
            User.merchant_id
            == merchant.id,
            User.email == email,
            User.is_active.is_(
                True,
            ),
        )
    )

    if user is None:
        raise InvalidCredentialsError

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise InvalidCredentialsError

    user.last_login_at = datetime.now(
        timezone.utc,
    )

    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=str(user.id),
        merchant_id=str(
            user.merchant_id,
        ),
        role=user.role,
    )

    return LoginResponse(
        access_token=token,
        expires_in=(
            settings
            .access_token_expire_minutes
            * 60
        ),
        user=AuthUser(
            id=str(user.id),
            merchant_id=str(
                user.merchant_id,
            ),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )


def register_merchant_admin(
    db: Session,
    registration: RegisterRequest,
) -> RegisterResponse:
    merchant_name = (
        registration.merchant_name
        .strip()
    )

    merchant_slug = (
        registration.merchant_slug
        .strip()
        .lower()
    )

    full_name = (
        registration.full_name
        .strip()
    )

    email = (
        str(registration.email)
        .strip()
        .lower()
    )

    existing_merchant = db.scalar(
        select(Merchant).where(
            Merchant.slug
            == merchant_slug
        )
    )

    if existing_merchant is not None:
        raise RegistrationConflictError(
            "That merchant workspace is already in use."
        )

    try:
        merchant = Merchant(
            name=merchant_name,
            slug=merchant_slug,
            is_active=True,
        )

        db.add(merchant)
        db.flush()

        user = User(
            merchant_id=merchant.id,
            email=email,
            full_name=full_name,
            password_hash=hash_password(
                registration.password
            ),
            role="ADMIN",
            is_active=True,
            last_login_at=datetime.now(
                timezone.utc,
            ),
        )

        db.add(user)
        db.commit()

        db.refresh(merchant)
        db.refresh(user)

    except IntegrityError as exc:
        db.rollback()

        raise RegistrationConflictError(
            "That workspace or account already exists."
        ) from exc

    token = create_access_token(
        subject=str(user.id),
        merchant_id=str(
            merchant.id,
        ),
        role=user.role,
    )

    return RegisterResponse(
        access_token=token,
        expires_in=(
            settings
            .access_token_expire_minutes
            * 60
        ),
        merchant_slug=merchant.slug,
        merchant_name=merchant.name,
        user=AuthUser(
            id=str(user.id),
            merchant_id=str(
                merchant.id,
            ),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )
