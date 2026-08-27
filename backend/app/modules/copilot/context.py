from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Incident, Investigation, Recommendation


def get_latest_relevant_incident(
    db: Session,
    *,
    merchant_id,
    payment_method: str | None = None,
) -> Incident | None:
    query = select(Incident).where(
        Incident.merchant_id == merchant_id,
        ~Incident.status.in_(["RESOLVED", "CLOSED"]),
    )

    if payment_method is not None:
        query = query.where(
            Incident.payment_method == payment_method
        )

    query = query.order_by(
        Incident.detected_at.desc()
    )

    return db.scalar(query.limit(1))


def get_investigation(
    db: Session,
    *,
    merchant_id,
    incident_id,
) -> Investigation | None:
    return db.scalar(
        select(Investigation)
        .where(
            Investigation.merchant_id == merchant_id,
            Investigation.incident_id == incident_id,
            Investigation.status == "COMPLETED",
        )
        .order_by(
            Investigation.created_at.desc()
        )
        .limit(1)
    )


def get_recommendation(
    db: Session,
    *,
    merchant_id,
    incident_id,
) -> Recommendation | None:
    return db.scalar(
        select(Recommendation)
        .where(
            Recommendation.merchant_id == merchant_id,
            Recommendation.incident_id == incident_id,
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .limit(1)
    )
