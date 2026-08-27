from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models import User
from app.modules.copilot.context import (
    get_investigation,
    get_latest_relevant_incident,
    get_recommendation,
)
from app.modules.copilot.intents import (
    CopilotIntent,
    classify_intent,
    extract_payment_method,
)
from app.modules.copilot.schemas import (
    CopilotEvidence,
    CopilotIncidentReference,
    CopilotQueryRequest,
    CopilotQueryResponse,
)


NO_DATA_ANSWER = (
    "There is not enough PayGuard data to determine "
    "the cause yet."
)


def _incident_reference(incident):
    return CopilotIncidentReference(
        id=incident.id,
        incident_number=(
            f"PG-{str(incident.id)[:8].upper()}"
        ),
    )


def _percentage(value: float | None) -> str | None:
    if value is None:
        return None

    return f"{value:.1%}"


def _money_from_paise(value: int | None) -> str | None:
    if value is None:
        return None

    rupees = value / 100

    return f"₹{rupees:,.2f}"


def answer_copilot_query(
    db: Session,
    *,
    payload: CopilotQueryRequest,
    current_user: User,
) -> CopilotQueryResponse:
    intent = classify_intent(payload.question)
    payment_method = extract_payment_method(
        payload.question
    )

    incident = get_latest_relevant_incident(
        db,
        merchant_id=current_user.merchant_id,
        payment_method=payment_method,
    )

    conversation_id = (
        payload.conversation_id or uuid4()
    )
    message_id = uuid4()
    generated_at = datetime.now(timezone.utc)

    if incident is None:
        return CopilotQueryResponse(
            conversation_id=conversation_id,
            message_id=message_id,
            intent=intent,
            answer=NO_DATA_ANSWER,
            referenced_incidents=[],
            referenced_transactions=[],
            evidence=[],
            generated_at=generated_at,
        )

    investigation = get_investigation(
        db,
        merchant_id=current_user.merchant_id,
        incident_id=incident.id,
    )

    recommendation = get_recommendation(
        db,
        merchant_id=current_user.merchant_id,
        incident_id=incident.id,
    )

    evidence: list[CopilotEvidence] = []

    current_rate = _percentage(
        incident.current_failure_rate
    )
    baseline_rate = _percentage(
        incident.baseline_failure_rate
    )

    if current_rate is not None:
        evidence.append(
            CopilotEvidence(
                label=(
                    f"Current "
                    f"{incident.payment_method or 'payment'} "
                    f"failure rate"
                ),
                value=current_rate,
            )
        )

    if baseline_rate is not None:
        evidence.append(
            CopilotEvidence(
                label=(
                    f"Historical "
                    f"{incident.payment_method or 'payment'} "
                    f"failure rate"
                ),
                value=baseline_rate,
            )
        )

    if (
        incident.failed_transactions is not None
        and incident.affected_transactions
    ):
        evidence.append(
            CopilotEvidence(
                label="Affected transaction failures",
                value=(
                    f"{incident.failed_transactions}/"
                    f"{incident.affected_transactions}"
                ),
            )
        )

    if incident.bank_name:
        evidence.append(
            CopilotEvidence(
                label="Affected bank",
                value=incident.bank_name,
            )
        )

    revenue = _money_from_paise(
        incident.revenue_at_risk
    )

    if revenue is not None:
        evidence.append(
            CopilotEvidence(
                label="Revenue at risk",
                value=revenue,
            )
        )

    if intent == CopilotIntent.REVENUE_AT_RISK:
        if revenue is None:
            answer = NO_DATA_ANSWER
        else:
            answer = (
                f"PayGuard currently calculates "
                f"{revenue} of revenue at risk for the "
                f"active {incident.incident_type} incident. "
                f"This amount comes from deterministic backend "
                f"calculations, not from the AI layer."
            )

    elif intent in {
        CopilotIntent.PAYMENT_METHOD_ANALYSIS,
        CopilotIntent.BANK_ANALYSIS,
        CopilotIntent.INCIDENT_EXPLANATION,
        CopilotIntent.INCIDENT_SUMMARY,
        CopilotIntent.GENERAL_RISK_QUESTION,
    }:
        if investigation is not None:
            answer = investigation.summary

            if investigation.root_cause:
                answer += (
                    f" Current evidence suggests: "
                    f"{investigation.root_cause}"
                )

            if recommendation is not None:
                answer += (
                    f" PayGuard recommends: "
                    f"{recommendation.title}."
                )

        else:
            answer = incident.description or incident.title

    else:
        answer = incident.description or incident.title

    return CopilotQueryResponse(
        conversation_id=conversation_id,
        message_id=message_id,
        intent=intent,
        answer=answer,
        referenced_incidents=[
            _incident_reference(incident)
        ],
        referenced_transactions=[],
        evidence=evidence,
        generated_at=generated_at,
    )
