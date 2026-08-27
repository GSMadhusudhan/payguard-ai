from app.db.models import Incident
from app.modules.ai.investigation.schemas import InvestigationContext


def build_investigation_context(
    incident: Incident,
) -> InvestigationContext:
    evidence: dict[str, object] = {}

    if incident.baseline_failure_rate is not None:
        evidence["baseline_failure_rate"] = (
            incident.baseline_failure_rate
        )

    if incident.current_failure_rate is not None:
        evidence["current_failure_rate"] = (
            incident.current_failure_rate
        )

    if (
        incident.baseline_failure_rate is not None
        and incident.current_failure_rate is not None
        and incident.baseline_failure_rate > 0
    ):
        evidence["failure_rate_ratio"] = (
            incident.current_failure_rate
            / incident.baseline_failure_rate
        )

    if incident.affected_transactions is not None:
        evidence["affected_transactions"] = (
            incident.affected_transactions
        )

    if incident.failed_transactions is not None:
        evidence["failed_transactions"] = (
            incident.failed_transactions
        )

    if (
        incident.affected_transactions
        and incident.failed_transactions is not None
    ):
        evidence["observed_failure_share"] = (
            incident.failed_transactions
            / incident.affected_transactions
        )

    if incident.revenue_at_risk is not None:
        evidence["revenue_at_risk"] = (
            incident.revenue_at_risk
        )

    return InvestigationContext(
        incident_id=str(incident.id),
        incident_type=incident.incident_type,
        severity=incident.severity,
        status=incident.status,
        risk_score=incident.risk_score,
        payment_method=incident.payment_method,
        bank_name=incident.bank_name,
        baseline_failure_rate=(
            incident.baseline_failure_rate
        ),
        current_failure_rate=(
            incident.current_failure_rate
        ),
        affected_transactions=(
            incident.affected_transactions
        ),
        failed_transactions=(
            incident.failed_transactions
        ),
        revenue_at_risk=incident.revenue_at_risk,
        evidence=evidence,
    )
