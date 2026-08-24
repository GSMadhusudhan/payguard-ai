from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import AuthUser, LoginRequest, LoginResponse
from app.modules.auth.service import (
    InvalidCredentialsError,
    authenticate_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:
    try:
        return authenticate_user(db, credentials)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


@router.get(
    "/me",
    response_model=AuthUser,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> AuthUser:
    return AuthUser(
        id=str(current_user.id),
        merchant_id=str(current_user.merchant_id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )
