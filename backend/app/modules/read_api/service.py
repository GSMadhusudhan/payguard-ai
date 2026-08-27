from datetime import timedelta
from math import ceil

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.models import (
    Incident,
    Investigation,
    Recommendation,
    Transaction,
)
from app.modules.read_api.schemas import (
    IncidentDetail,
    IncidentListItem,
    InvestigationDetail,
    InvestigationListItem,
    Pagination,
    RecommendationListItem,
    TransactionDetail,
    TransactionListItem,
)


def _incident_number(incident: Incident) -> str:
    year = incident.detected_at.year
    short_id = str(incident.id)[:8].upper()
    return f"PG-{year}-{short_id}"


def _pagination(
    *,
    page: int,
    page_size: int,
    total: int,
) -> Pagination:
    return Pagination(
        page=page,
        page_size=page_size,
        total_items=total,
        total_pages=(
            ceil(total / page_size)
            if total
            else 0
        ),
    )


def list_transactions(
    db: Session,
    *,
    merchant_id,
    page: int,
    page_size: int,
    risk_level: str | None = None,
    status: str | None = None,
    payment_method: str | None = None,
    bank: str | None = None,
    search: str | None = None,
    sort_by: str = "occurred_at",
    sort_order: str = "desc",
):
    conditions = [
        Transaction.merchant_id == merchant_id
    ]

    if risk_level:
        conditions.append(
            Transaction.risk_level
            == risk_level.upper()
        )

    if status:
        conditions.append(
            Transaction.status
            == status.upper()
        )

    if payment_method:
        conditions.append(
            Transaction.payment_method
            == payment_method.upper()
        )

    if bank:
        conditions.append(
            Transaction.bank_name.ilike(
                f"%{bank}%"
            )
        )

    if search:
        pattern = f"%{search}%"

        conditions.append(
            or_(
                Transaction.provider_payment_id.ilike(
                    pattern
                ),
                Transaction.customer_reference.ilike(
                    pattern
                ),
                Transaction.bank_name.ilike(
                    pattern
                ),
            )
        )

    total = db.scalar(
        select(func.count())
        .select_from(Transaction)
        .where(*conditions)
    ) or 0

    sort_fields = {
        "occurred_at": Transaction.occurred_at,
        "amount": Transaction.amount,
        "risk_score": Transaction.risk_score,
        "status": Transaction.status,
    }

    sort_column = sort_fields.get(
        sort_by,
        Transaction.occurred_at,
    )

    order = (
        sort_column.asc()
        if sort_order.lower() == "asc"
        else sort_column.desc()
    )

    rows = db.scalars(
        select(Transaction)
        .where(*conditions)
        .order_by(order)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    data = [
        TransactionListItem(
            id=txn.id,
            external_payment_id=(
                txn.provider_payment_id
            ),
            amount=txn.amount,
            currency=txn.currency,
            payment_method=txn.payment_method,
            bank=txn.bank_name,
            status=txn.status,
            risk_score=txn.risk_score,
            risk_level=txn.risk_level,
            occurred_at=txn.occurred_at,
        )
        for txn in rows
    ]

    return data, _pagination(
        page=page,
        page_size=page_size,
        total=total,
    )


def get_transaction(
    db: Session,
    *,
    merchant_id,
    transaction_id,
) -> TransactionDetail | None:
    txn = db.scalar(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.merchant_id
            == merchant_id,
        )
    )

    if txn is None:
        return None

    return TransactionDetail(
        id=txn.id,
        merchant_id=txn.merchant_id,
        external_payment_id=(
            txn.provider_payment_id
        ),
        payment_provider=txn.provider,
        amount=txn.amount,
        currency=txn.currency,
        payment_method=txn.payment_method,
        bank=txn.bank_name,
        status=txn.status,
        failure_code=txn.failure_code,
        failure_reason=txn.failure_reason,
        customer_reference=(
            txn.customer_reference
        ),
        occurred_at=txn.occurred_at,
        risk={
            "score": txn.risk_score,
            "level": txn.risk_level,
            "model_version": "risk-v1",
        },
    )


def list_incidents(
    db: Session,
    *,
    merchant_id,
    page: int,
    page_size: int,
    status: str | None = None,
    severity: str | None = None,
    incident_type: str | None = None,
    payment_method: str | None = None,
    bank: str | None = None,
    sort_order: str = "desc",
):
    conditions = [
        Incident.merchant_id == merchant_id
    ]

    if status:
        conditions.append(
            Incident.status == status.upper()
        )

    if severity:
        conditions.append(
            Incident.severity == severity.upper()
        )

    if incident_type:
        conditions.append(
            Incident.incident_type
            == incident_type.upper()
        )

    if payment_method:
        conditions.append(
            Incident.payment_method
            == payment_method.upper()
        )

    if bank:
        conditions.append(
            Incident.bank_name.ilike(
                f"%{bank}%"
            )
        )

    total = db.scalar(
        select(func.count())
        .select_from(Incident)
        .where(*conditions)
    ) or 0

    order = (
        Incident.detected_at.asc()
        if sort_order.lower() == "asc"
        else Incident.detected_at.desc()
    )

    rows = db.scalars(
        select(Incident)
        .where(*conditions)
        .order_by(order)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    data = [
        IncidentListItem(
            id=incident.id,
            incident_number=_incident_number(
                incident
            ),
            title=incident.title,
            incident_type=incident.incident_type,
            severity=incident.severity,
            status=incident.status,
            risk_score=incident.risk_score,
            affected_transaction_count=(
                incident.affected_transactions or 0
            ),
            failed_transaction_count=(
                incident.failed_transactions or 0
            ),
            revenue_at_risk=(
                incident.revenue_at_risk or 0
            ),
            currency="INR",
            payment_method=(
                incident.payment_method
            ),
            bank=incident.bank_name,
            detected_at=incident.detected_at,
        )
        for incident in rows
    ]

    return data, _pagination(
        page=page,
        page_size=page_size,
        total=total,
    )


def get_incident(
    db: Session,
    *,
    merchant_id,
    incident_id,
) -> IncidentDetail | None:
    incident = db.scalar(
        select(Incident).where(
            Incident.id == incident_id,
            Incident.merchant_id
            == merchant_id,
        )
    )

    if incident is None:
        return None

    investigation = db.scalar(
        select(Investigation)
        .where(
            Investigation.merchant_id
            == merchant_id,
            Investigation.incident_id
            == incident.id,
            Investigation.status
            == "COMPLETED",
        )
        .order_by(
            Investigation.created_at.desc()
        )
        .limit(1)
    )

    affected_payment_value = 0

    if (
        incident.detected_at is not None
        and incident.payment_method is not None
    ):
        start = (
            incident.detected_at
            - timedelta(minutes=10)
        )

        txn_conditions = [
            Transaction.merchant_id
            == merchant_id,
            Transaction.payment_method
            == incident.payment_method,
            Transaction.occurred_at >= start,
            Transaction.occurred_at
            <= incident.detected_at,
        ]

        if incident.bank_name:
            txn_conditions.append(
                Transaction.bank_name
                == incident.bank_name
            )

        affected_payment_value = (
            db.scalar(
                select(
                    func.coalesce(
                        func.sum(
                            Transaction.amount
                        ),
                        0,
                    )
                ).where(*txn_conditions)
            )
            or 0
        )

    return IncidentDetail(
        id=incident.id,
        incident_number=_incident_number(
            incident
        ),
        title=incident.title,
        description=incident.description,
        incident_type=incident.incident_type,
        severity=incident.severity,
        status=incident.status,
        risk_score=incident.risk_score,
        confidence_score=(
            investigation.confidence_score
            if investigation
            else None
        ),
        affected_transaction_count=(
            incident.affected_transactions or 0
        ),
        failed_transaction_count=(
            incident.failed_transactions or 0
        ),
        affected_payment_value=int(
            affected_payment_value
        ),
        revenue_at_risk=(
            incident.revenue_at_risk or 0
        ),
        currency="INR",
        primary_payment_method=(
            incident.payment_method
        ),
        primary_bank=incident.bank_name,
        baseline_failure_rate=(
            incident.baseline_failure_rate
        ),
        current_failure_rate=(
            incident.current_failure_rate
        ),
        detected_at=incident.detected_at,
        resolved_at=incident.resolved_at,
    )


def _model_name(investigation) -> str | None:
    return (
        getattr(
            investigation,
            "model_name",
            None,
        )
        or getattr(
            investigation,
            "ai_model",
            None,
        )
        or getattr(
            investigation,
            "model",
            None,
        )
    )


def _provider(investigation) -> str | None:
    return (
        getattr(
            investigation,
            "provider",
            None,
        )
        or getattr(
            investigation,
            "ai_provider",
            None,
        )
        or getattr(
            investigation,
            "model_provider",
            None,
        )
    )


def list_investigations(
    db: Session,
    *,
    merchant_id,
    incident_id,
) -> list[InvestigationListItem]:
    rows = db.scalars(
        select(Investigation)
        .where(
            Investigation.merchant_id
            == merchant_id,
            Investigation.incident_id
            == incident_id,
        )
        .order_by(
            Investigation.created_at.desc()
        )
    ).all()

    return [
        InvestigationListItem(
            id=item.id,
            incident_id=item.incident_id,
            status=item.status,
            summary=item.summary,
            likely_root_cause=(
                item.root_cause
            ),
            confidence_score=(
                item.confidence_score
            ),
            model_name=_model_name(item),
            prompt_version=getattr(
                item,
                "prompt_version",
                None,
            ),
            created_at=item.created_at,
        )
        for item in rows
    ]


def get_investigation(
    db: Session,
    *,
    merchant_id,
    investigation_id,
) -> InvestigationDetail | None:
    item = db.scalar(
        select(Investigation).where(
            Investigation.id
            == investigation_id,
            Investigation.merchant_id
            == merchant_id,
        )
    )

    if item is None:
        return None

    findings = (
        item.findings
        if isinstance(
            item.findings,
            dict,
        )
        else {}
    )

    evidence = (
        item.evidence
        if isinstance(
            item.evidence,
            list,
        )
        else []
    )

    uncertainty = (
        item.uncertainty
        if isinstance(
            item.uncertainty,
            list,
        )
        else []
    )

    return InvestigationDetail(
        id=item.id,
        incident_id=item.incident_id,
        status=item.status,
        summary=item.summary,
        likely_root_cause=item.root_cause,
        confidence_score=(
            item.confidence_score
        ),
        evidence=evidence,
        alternative_explanations=(
            findings.get(
                "alternative_explanations",
                [],
            )
        ),
        uncertainties=uncertainty,
        recommended_next_checks=(
            findings.get(
                "recommended_next_checks",
                [],
            )
        ),
        provider=_provider(item),
        model_name=_model_name(item),
        prompt_version=getattr(
            item,
            "prompt_version",
            None,
        ),
        created_at=item.created_at,
    )


def _recommendation_item(
    item: Recommendation,
) -> RecommendationListItem:
    return RecommendationListItem(
        id=item.id,
        incident_id=item.incident_id,
        investigation_id=(
            item.investigation_id
        ),
        recommendation_type=(
            item.recommendation_type
        ),
        title=item.title,
        rationale=item.rationale,
        confidence_score=(
            item.confidence_score
        ),
        proposed_action=(
            item.proposed_action or {}
        ),
        expected_impact=(
            item.expected_impact or {}
        ),
        requires_approval=(
            item.approval_required
        ),
        approval_status=(
            item.approval_status
        ),
        status=item.status,
        execution_mode=(
            item.execution_mode
        ),
        execution_result=(
            item.execution_result
        ),
        approved_by=item.approved_by,
        approved_at=item.approved_at,
        created_at=item.created_at,
    )


def list_recommendations(
    db: Session,
    *,
    merchant_id,
    incident_id,
) -> list[RecommendationListItem]:
    rows = db.scalars(
        select(Recommendation)
        .where(
            Recommendation.merchant_id
            == merchant_id,
            Recommendation.incident_id
            == incident_id,
        )
        .order_by(
            Recommendation.created_at.desc()
        )
    ).all()

    return [
        _recommendation_item(item)
        for item in rows
    ]


def get_recommendation(
    db: Session,
    *,
    merchant_id,
    recommendation_id,
) -> RecommendationListItem | None:
    item = db.scalar(
        select(Recommendation).where(
            Recommendation.id
            == recommendation_id,
            Recommendation.merchant_id
            == merchant_id,
        )
    )

    if item is None:
        return None

    return _recommendation_item(item)
