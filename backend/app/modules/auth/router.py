from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import LoginRequest, LoginResponse
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
