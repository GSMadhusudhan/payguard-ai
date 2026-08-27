from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Transaction


def calculate_revenue_at_risk(
    db: Session,
    *,
    merchant_id,
    start: datetime,
    end: datetime,
    payment_method: str,
    bank_name: str,
) -> int:
    """
    MVP deterministic formula:

    Revenue at Risk =
        sum of FAILED transaction amounts
        correlated to the active incident window.

    Amounts remain in integer smallest-currency units (paise).
    """
    value = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.merchant_id == merchant_id,
            Transaction.occurred_at >= start,
            Transaction.occurred_at <= end,
            Transaction.payment_method == payment_method,
            Transaction.bank_name == bank_name,
            Transaction.status == "FAILED",
        )
    )

    return int(value or 0)
