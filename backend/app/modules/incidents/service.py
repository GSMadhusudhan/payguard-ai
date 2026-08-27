from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Incident
from app.modules.analytics.revenue_risk.service import (
    calculate_revenue_at_risk,
)
from app.modules.risk import config
from app.modules.risk.features.queries import (
    count_transactions,
    failure_rate,
)
from app.modules.risk.service import RiskAssessment
from app.modules.transactions.schemas import TransactionIngestRequest


def classify_incident_severity(
    revenue_at_risk: int,
) -> str:
    if revenue_at_risk > config.REVENUE_IMPACT_CRITICAL:
        return "CRITICAL"

    if revenue_at_risk >= config.REVENUE_IMPACT_HIGH:
        return "HIGH"

    if revenue_at_risk >= config.REVENUE_IMPACT_MEDIUM:
        return "MEDIUM"

    return "LOW"


def detect_bank_degradation(
    db: Session,
    *,
    merchant_id,
    payload: TransactionIngestRequest,
    assessment: RiskAssessment,
) -> Incident | None:
    if not payload.bank_name:
        return None

    end = payload.occurred_at
    start = end - timedelta(
        minutes=config.INCIDENT_WINDOW_MINUTES
    )

    baseline_start = end - timedelta(
        hours=config.HISTORICAL_BASELINE_HOURS
    )
    baseline_end = start

    bank_total, bank_failed, bank_rate = failure_rate(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end + timedelta(microseconds=1),
        payment_method=payload.payment_method,
        bank_name=payload.bank_name,
    )

    _, _, baseline_rate = failure_rate(
        db,
        merchant_id=merchant_id,
        start=baseline_start,
        end=baseline_end,
        payment_method=payload.payment_method,
        bank_name=payload.bank_name,
    )

    method_failures = count_transactions(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end + timedelta(microseconds=1),
        payment_method=payload.payment_method,
        status="FAILED",
    )

    concentration = (
        bank_failed / method_failures
        if method_failures > 0
        else 0.0
    )

    if bank_total < config.BANK_MIN_SAMPLE_SIZE:
        return None

    if baseline_rate is None or baseline_rate <= 0:
        return None

    if bank_rate is None:
        return None

    if (
        bank_rate
        < baseline_rate
        * config.BANK_INCIDENT_FAILURE_MULTIPLIER
    ):
        return None

    if (
        concentration
        <= config.BANK_INCIDENT_CONCENTRATION_THRESHOLD
    ):
        return None

    revenue_at_risk = calculate_revenue_at_risk(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end,
        payment_method=payload.payment_method,
        bank_name=payload.bank_name,
    )

    severity = classify_incident_severity(
        revenue_at_risk
    )

    existing = db.scalar(
        select(Incident).where(
            Incident.merchant_id == merchant_id,
            Incident.incident_type == "BANK_DEGRADATION",
            Incident.payment_method == payload.payment_method,
            Incident.bank_name == payload.bank_name,
            Incident.detected_at >= start,
            Incident.detected_at <= end,
            ~Incident.status.in_(["RESOLVED", "CLOSED"]),
        )
    )

    title = (
        f"{payload.payment_method} failure spike "
        f"associated with {payload.bank_name}"
    )

    description = (
        f"{payload.bank_name} {payload.payment_method} "
        f"failure rate increased to {bank_rate:.1%} "
        f"from a historical baseline of "
        f"{baseline_rate:.1%}. "
        f"{concentration:.1%} of current "
        f"{payload.payment_method} failures are "
        f"concentrated in this bank."
    )

    if existing is not None:
        existing.title = title
        existing.description = description
        existing.severity = severity
        existing.risk_score = assessment.result.risk_score
        existing.baseline_failure_rate = baseline_rate
        existing.current_failure_rate = bank_rate
        existing.affected_transactions = bank_total
        existing.failed_transactions = bank_failed
        existing.revenue_at_risk = revenue_at_risk

        return existing

    incident = Incident(
        merchant_id=merchant_id,
        incident_type="BANK_DEGRADATION",
        title=title,
        description=description,
        severity=severity,
        status="DETECTED",
        risk_score=assessment.result.risk_score,
        payment_method=payload.payment_method,
        bank_name=payload.bank_name,
        baseline_failure_rate=baseline_rate,
        current_failure_rate=bank_rate,
        affected_transactions=bank_total,
        failed_transactions=bank_failed,
        revenue_at_risk=revenue_at_risk,
        detected_at=payload.occurred_at,
    )

    db.add(incident)

    return incident
