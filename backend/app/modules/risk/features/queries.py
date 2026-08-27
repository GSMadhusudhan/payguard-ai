from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Transaction


def count_transactions(
    db: Session,
    *,
    merchant_id,
    start: datetime,
    end: datetime,
    customer_reference: str | None = None,
    payment_method: str | None = None,
    bank_name: str | None = None,
    amount: int | None = None,
    status: str | None = None,
) -> int:
    conditions = [
        Transaction.merchant_id == merchant_id,
        Transaction.occurred_at >= start,
        Transaction.occurred_at < end,
    ]

    if customer_reference is not None:
        conditions.append(
            Transaction.customer_reference == customer_reference
        )

    if payment_method is not None:
        conditions.append(
            Transaction.payment_method == payment_method
        )

    if bank_name is not None:
        conditions.append(Transaction.bank_name == bank_name)

    if amount is not None:
        conditions.append(Transaction.amount == amount)

    if status is not None:
        conditions.append(Transaction.status == status)

    value = db.scalar(
        select(func.count(Transaction.id)).where(*conditions)
    )

    return int(value or 0)


def customer_amount_statistics(
    db: Session,
    *,
    merchant_id,
    customer_reference: str | None,
    before: datetime,
) -> tuple[int, float | None, float | None]:
    if customer_reference is None:
        return 0, None, None

    row = db.execute(
        select(
            func.count(Transaction.id),
            func.avg(Transaction.amount),
            func.stddev_pop(Transaction.amount),
        ).where(
            Transaction.merchant_id == merchant_id,
            Transaction.customer_reference == customer_reference,
            Transaction.status == "SUCCESS",
            Transaction.occurred_at < before,
        )
    ).one()

    count = int(row[0] or 0)
    average = float(row[1]) if row[1] is not None else None
    deviation = float(row[2]) if row[2] is not None else None

    return count, average, deviation


def customer_historical_risk(
    db: Session,
    *,
    merchant_id,
    customer_reference: str | None,
    before: datetime,
) -> int | None:
    if customer_reference is None:
        return None

    value = db.scalar(
        select(func.avg(Transaction.risk_score)).where(
            Transaction.merchant_id == merchant_id,
            Transaction.customer_reference == customer_reference,
            Transaction.occurred_at < before,
        )
    )

    if value is None:
        return None

    return max(0, min(int(round(float(value))), 100))


def failure_rate(
    db: Session,
    *,
    merchant_id,
    start: datetime,
    end: datetime,
    payment_method: str | None = None,
    bank_name: str | None = None,
) -> tuple[int, int, float | None]:
    total = count_transactions(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end,
        payment_method=payment_method,
        bank_name=bank_name,
    )

    failed = count_transactions(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end,
        payment_method=payment_method,
        bank_name=bank_name,
        status="FAILED",
    )

    rate = failed / total if total else None

    return total, failed, rate


def refund_rate(
    db: Session,
    *,
    merchant_id,
    start: datetime,
    end: datetime,
) -> tuple[int, int, float | None]:
    total = count_transactions(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end,
    )

    refunds = count_transactions(
        db,
        merchant_id=merchant_id,
        start=start,
        end=end,
        status="REFUNDED",
    )

    rate = refunds / total if total else None

    return total, refunds, rate
