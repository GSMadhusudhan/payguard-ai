from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    Incident,
    Investigation,
    Recommendation,
    User,
)
from app.modules.recommendations.schemas import (
    RecommendationApprovalResponse,
    RecommendationExecutionResponse,
)


class RecommendationNotFoundError(Exception):
    """Raised when the recommendation does not exist for this merchant."""


class RecommendationStateError(Exception):
    """Raised when a recommendation action is invalid for its current state."""


def generate_recommendation(
    db: Session,
    *,
    incident: Incident,
    investigation: Investigation,
) -> Recommendation:
    existing = db.scalar(
        select(Recommendation).where(
            Recommendation.merchant_id == incident.merchant_id,
            Recommendation.incident_id == incident.id,
            Recommendation.recommendation_type == "TRAFFIC_REROUTE",
        )
    )

    if existing is not None:
        return existing

    if incident.incident_type == "BANK_DEGRADATION":
        title = (
            f"Temporarily reroute "
            f"{incident.bank_name or 'affected bank'} "
            f"{incident.payment_method or 'payment'} traffic"
        )

        rationale = (
            f"Current evidence suggests possible "
            f"{incident.payment_method or 'payment'} degradation "
            f"associated with "
            f"{incident.bank_name or 'the affected bank'}. "
            f"The mitigation is proposed for human review and "
            f"will execute only in SIMULATED mode."
        )

        proposed_action = {
            "action": "REROUTE_TRAFFIC",
            "scope": {
                "payment_method": incident.payment_method,
                "bank_name": incident.bank_name,
            },
            "mode": "SIMULATED",
            "requires_human_approval": True,
        }

        expected_impact = {
            "objective": "reduce exposure to the degraded payment path",
            "revenue_at_risk_reference": incident.revenue_at_risk,
            "note": (
                "No numerical recovery percentage is fabricated. "
                "Actual impact must be measured after mitigation."
            ),
        }

    else:
        title = "Review and mitigate detected payment risk"

        rationale = (
            "PayGuard identified an incident requiring analyst review. "
            "The proposed action remains simulated until sufficient "
            "evidence and human approval are available."
        )

        proposed_action = {
            "action": "REVIEW_AND_MONITOR",
            "mode": "SIMULATED",
            "requires_human_approval": True,
        }

        expected_impact = {
            "objective": "reduce operational risk while preserving human control"
        }

    recommendation = Recommendation(
        merchant_id=incident.merchant_id,
        incident_id=incident.id,
        investigation_id=investigation.id,
        recommendation_type="TRAFFIC_REROUTE",
        title=title,
        rationale=rationale,
        confidence_score=investigation.confidence_score,
        proposed_action=proposed_action,
        expected_impact=expected_impact,
        status="PROPOSED",
        approval_required=True,
        approval_status="PENDING",
        execution_mode="SIMULATED",
        execution_result=None,
        model_provider=investigation.model_provider,
        model_name=investigation.model_name,
        prompt_version="recommendation-v1",
    )

    db.add(recommendation)

    incident.status = "ACTION_RECOMMENDED"

    db.flush()

    return recommendation


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


def execute_recommendation(
    db: Session,
    recommendation_id: UUID,
    current_user: User,
) -> RecommendationExecutionResponse:
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

    if (
        recommendation.status == "EXECUTED"
        and recommendation.execution_result is not None
    ):
        return RecommendationExecutionResponse(
            id=recommendation.id,
            incident_id=recommendation.incident_id,
            status=recommendation.status,
            approval_status=recommendation.approval_status,
            execution_mode=recommendation.execution_mode,
            execution_result=recommendation.execution_result,
        )

    if recommendation.approval_required:
        if recommendation.approval_status != "APPROVED":
            raise RecommendationStateError(
                "Recommendation must be approved before execution"
            )

    if recommendation.execution_mode != "SIMULATED":
        raise RecommendationStateError(
            "Only SIMULATED execution is enabled for the demo"
        )

    now = datetime.now(timezone.utc)

    recommendation.execution_result = {
        "success": True,
        "simulated": True,
        "executed_at": now.isoformat(),
        "action": recommendation.proposed_action.get("action"),
        "scope": recommendation.proposed_action.get("scope", {}),
        "message": (
            "Mitigation was simulated successfully. "
            "No live payment-routing configuration was changed."
        ),
    }

    recommendation.status = "EXECUTED"

    db.commit()
    db.refresh(recommendation)

    return RecommendationExecutionResponse(
        id=recommendation.id,
        incident_id=recommendation.incident_id,
        status=recommendation.status,
        approval_status=recommendation.approval_status,
        execution_mode=recommendation.execution_mode,
        execution_result=recommendation.execution_result,
    )
