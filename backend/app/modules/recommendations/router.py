from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import require_admin
from app.modules.recommendations.schemas import RecommendationApprovalResponse
from app.modules.recommendations.service import (
    RecommendationNotFoundError,
    RecommendationStateError,
    approve_recommendation,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post(
    "/{recommendation_id}/approve",
    response_model=RecommendationApprovalResponse,
    status_code=status.HTTP_200_OK,
)
def approve(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> RecommendationApprovalResponse:
    try:
        return approve_recommendation(
            db=db,
            recommendation_id=recommendation_id,
            current_user=current_user,
        )
    except RecommendationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        ) from None
    except RecommendationStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from None
