from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Transaction, User
from app.modules.risk.service import evaluate_transaction_risk
from app.modules.transactions.schemas import (
    TransactionIngestRequest,
    TransactionIngestResponse,
)


def _response(
    transaction: Transaction,
    *,
    duplicate: bool,
) -> TransactionIngestResponse:
    return TransactionIngestResponse(
        id=transaction.id,
        provider_payment_id=transaction.provider_payment_id,
        amount=transaction.amount,
        currency=transaction.currency,
        payment_method=transaction.payment_method,
        status=transaction.status,
        risk_score=transaction.risk_score,
        risk_level=transaction.risk_level,
        duplicate=duplicate,
        occurred_at=transaction.occurred_at,
    )


def ingest_transaction(
    db: Session,
    payload: TransactionIngestRequest,
    current_user: User,
) -> TransactionIngestResponse:
    existing = db.scalar(
        select(Transaction).where(
            Transaction.merchant_id == current_user.merchant_id,
            Transaction.provider == payload.provider,
            Transaction.provider_payment_id
            == payload.provider_payment_id,
        )
    )

    if existing is not None:
        return _response(existing, duplicate=True)

    assessment = evaluate_transaction_risk(
        db,
        merchant_id=current_user.merchant_id,
        payload=payload,
    )

    transaction = Transaction(
        merchant_id=current_user.merchant_id,
        provider=payload.provider,
        provider_payment_id=payload.provider_payment_id,
        amount=payload.amount,
        currency=payload.currency,
        payment_method=payload.payment_method,
        status=payload.status,
        bank_name=payload.bank_name,
        customer_reference=payload.customer_reference,
        failure_code=payload.failure_code,
        failure_reason=payload.failure_reason,
        risk_score=assessment.result.risk_score,
        risk_level=assessment.result.risk_level.value,
        occurred_at=payload.occurred_at,
    )

    db.add(transaction)

    try:
        db.commit()
        db.refresh(transaction)

        return _response(
            transaction,
            duplicate=False,
        )

    except IntegrityError:
        db.rollback()

        existing = db.scalar(
            select(Transaction).where(
                Transaction.merchant_id
                == current_user.merchant_id,
                Transaction.provider == payload.provider,
                Transaction.provider_payment_id
                == payload.provider_payment_id,
            )
        )

        if existing is None:
            raise

        return _response(existing, duplicate=True)
