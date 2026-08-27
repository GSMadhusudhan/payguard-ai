from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Incident, Transaction
from app.modules.dashboard.schemas import (
    DashboardSummary,
    PaymentMethodPerformance,
    RiskDistributionItem,
)


def _today_start() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )


def _today_transactions(
    db: Session,
    merchant_id,
) -> list[Transaction]:
    return list(
        db.scalars(
            select(Transaction).where(
                Transaction.merchant_id == merchant_id,
                Transaction.occurred_at >= _today_start(),
            )
        ).all()
    )


def get_dashboard_summary(
    db: Session,
    *,
    merchant_id,
) -> DashboardSummary:
    transactions = _today_transactions(
        db,
        merchant_id,
    )

    total = len(transactions)

    successful = sum(
        1 for txn in transactions
        if txn.status == "SUCCESS"
    )

    failed = sum(
        1 for txn in transactions
        if txn.status == "FAILED"
    )

    success_rate = (
        successful / total
        if total
        else 0.0
    )

    failure_rate = (
        failed / total
        if total
        else 0.0
    )

    high_risk = sum(
        1 for txn in transactions
        if txn.risk_level == "HIGH"
    )

    critical_risk = sum(
        1 for txn in transactions
        if txn.risk_level == "CRITICAL"
    )

    incidents = list(
        db.scalars(
            select(Incident).where(
                Incident.merchant_id == merchant_id,
                ~Incident.status.in_(
                    ["RESOLVED", "CLOSED"]
                ),
            )
        ).all()
    )

    critical_incidents = sum(
        1 for incident in incidents
        if incident.severity == "CRITICAL"
    )

    revenue_at_risk = sum(
        incident.revenue_at_risk or 0
        for incident in incidents
    )

    # Deterministic health score for MVP:
    # today's successful payment percentage.
    payment_health_score = (
        round(success_rate * 100)
        if total
        else 100
    )

    return DashboardSummary(
        payment_health_score=payment_health_score,
        transactions_today=total,
        successful_transactions_today=successful,
        failed_transactions_today=failed,
        success_rate=success_rate,
        failure_rate=failure_rate,
        high_risk_transactions=high_risk,
        critical_risk_transactions=critical_risk,
        open_incidents=len(incidents),
        critical_incidents=critical_incidents,
        revenue_at_risk=revenue_at_risk,
        currency="INR",
        # Alert persistence is not implemented yet.
        active_alerts=0,
    )


def get_risk_distribution(
    db: Session,
    *,
    merchant_id,
) -> list[RiskDistributionItem]:
    transactions = _today_transactions(
        db,
        merchant_id,
    )

    counts = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0,
    }

    for txn in transactions:
        level = txn.risk_level

        if level in counts:
            counts[level] += 1

    return [
        RiskDistributionItem(
            risk_level=level,
            count=counts[level],
        )
        for level in (
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
        )
    ]


def get_payment_methods(
    db: Session,
    *,
    merchant_id,
) -> list[PaymentMethodPerformance]:
    transactions = _today_transactions(
        db,
        merchant_id,
    )

    grouped = defaultdict(list)

    for txn in transactions:
        grouped[
            txn.payment_method or "UNKNOWN"
        ].append(txn)

    output = []

    for payment_method, items in sorted(
        grouped.items()
    ):
        total = len(items)

        successful = sum(
            1 for txn in items
            if txn.status == "SUCCESS"
        )

        failed = sum(
            1 for txn in items
            if txn.status == "FAILED"
        )

        scores = [
            txn.risk_score
            for txn in items
            if txn.risk_score is not None
        ]

        average_risk = (
            round(sum(scores) / len(scores))
            if scores
            else 0
        )

        output.append(
            PaymentMethodPerformance(
                payment_method=payment_method,
                transaction_count=total,
                success_rate=(
                    successful / total
                    if total
                    else 0.0
                ),
                failure_rate=(
                    failed / total
                    if total
                    else 0.0
                ),
                risk_score=average_risk,
            )
        )

    return output
