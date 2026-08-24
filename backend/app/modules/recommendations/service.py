from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Recommendation, User
from app.modules.recommendations.schemas import RecommendationApprovalResponse


class RecommendationNotFoundError(Exception):
    """Raised when the recommendation does not exist for this merchant."""


class RecommendationStateError(Exception):
    """Raised when the recommendation cannot be approved in its current state."""


def approve_recommendation(
    db: Session,
    recommendation_id: UUID,
    current_user: User,
) -> RecommendationApprovalResponse:
    recommendation = db.scalar(
        select(Recommendation)
        .where(
            Recommendation.id == recommendation_id,
            Recommendation.merchant_id == current_user.merchant_id,
        )
        .with_for_update()
    )

    if recommendation is None:
        raise RecommendationNotFoundError

    if recommendation.approval_status == "APPROVED":
        return RecommendationApprovalResponse(
            id=recommendation.id,
            incident_id=recommendation.incident_id,
            approval_status=recommendation.approval_status,
            status=recommendation.status,
            approved_by_user_id=recommendation.approved_by_user_id,
            approved_by=recommendation.approved_by,
            approved_at=recommendation.approved_at,
            execution_mode=recommendation.execution_mode,
        )

    if not recommendation.approval_required:
        raise RecommendationStateError(
            "Recommendation does not require human approval"
        )

    if recommendation.approval_status != "PENDING":
        raise RecommendationStateError(
            "Recommendation is not pending approval"
        )

    recommendation.approval_status = "APPROVED"
    recommendation.status = "APPROVED"
    recommendation.approved_by_user_id = current_user.id
    recommendation.approved_by = current_user.email
    recommendation.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(recommendation)

    return RecommendationApprovalResponse(
        id=recommendation.id,
        incident_id=recommendation.incident_id,
        approval_status=recommendation.approval_status,
        status=recommendation.status,
        approved_by_user_id=recommendation.approved_by_user_id,
        approved_by=recommendation.approved_by,
        approved_at=recommendation.approved_at,
        execution_mode=recommendation.execution_mode,
    )
