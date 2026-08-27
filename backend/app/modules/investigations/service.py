from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Incident, Investigation
from app.modules.ai.investigation.context import (
    build_investigation_context,
)
from app.modules.ai.investigation.service import (
    PROMPT_VERSION,
    run_ai_investigation,
)


def investigate_incident(
    db: Session,
    *,
    incident: Incident,
) -> Investigation:
    existing = db.scalar(
        select(Investigation).where(
            Investigation.merchant_id == incident.merchant_id,
            Investigation.incident_id == incident.id,
            Investigation.status == "COMPLETED",
        )
    )

    if existing is not None:
        return existing

    incident.status = "INVESTIGATING"
    db.flush()

    context = build_investigation_context(incident)

    output, provider = run_ai_investigation(context)

    investigation = Investigation(
        merchant_id=incident.merchant_id,
        incident_id=incident.id,
        status="COMPLETED",
        summary=output.summary,
        root_cause=output.likely_root_cause,
        confidence_score=output.confidence,
        uncertainty={
            "items": output.uncertainties,
            "alternative_explanations": (
                output.alternative_explanations
            ),
        },
        evidence={
            "context": context.model_dump(mode="json"),
            "evidence": output.evidence,
        },
        findings={
            "recommended_next_checks": (
                output.recommended_next_checks
            ),
        },
        model_provider=provider.provider_name,
        model_name=provider.model_name,
        prompt_version=PROMPT_VERSION,
    )

    db.add(investigation)

    incident.status = "INVESTIGATED"

    db.commit()
    db.refresh(investigation)

    return investigation
