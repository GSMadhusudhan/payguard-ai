from datetime import timedelta

from sqlalchemy.orm import Session

from app.modules.risk import config
from app.modules.risk.features.queries import (
    count_transactions,
    customer_amount_statistics,
    customer_historical_risk,
    failure_rate,
    refund_rate,
)
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.transactions.schemas import TransactionIngestRequest


def _include_current(
    *,
    total: int,
    failures: int,
    current_status: str,
) -> tuple[int, float]:
    total += 1

    if current_status == "FAILED":
        failures += 1

    return total, failures / total


def extract_risk_features(
    db: Session,
    *,
    merchant_id,
    payload: TransactionIngestRequest,
) -> RiskFeatures:
    now = payload.occurred_at

    history_count, average_amount, amount_std = (
        customer_amount_statistics(
            db,
            merchant_id=merchant_id,
            customer_reference=payload.customer_reference,
            before=now,
        )
    )

    sixty_seconds_ago = now - timedelta(seconds=60)
    ten_minutes_ago = now - timedelta(minutes=10)

    if payload.customer_reference is not None:
        tx_60 = count_transactions(
            db,
            merchant_id=merchant_id,
            start=sixty_seconds_ago,
            end=now,
            customer_reference=payload.customer_reference,
        ) + 1

        tx_10m = count_transactions(
            db,
            merchant_id=merchant_id,
            start=ten_minutes_ago,
            end=now,
            customer_reference=payload.customer_reference,
        ) + 1

        failed_10m = count_transactions(
            db,
            merchant_id=merchant_id,
            start=ten_minutes_ago,
            end=now,
            customer_reference=payload.customer_reference,
            status="FAILED",
        )

        if payload.status == "FAILED":
            failed_10m += 1

    else:
        tx_60 = 0
        tx_10m = 0
        failed_10m = 0

    current_start = now - timedelta(
        minutes=config.CURRENT_FAILURE_WINDOW_MINUTES
    )

    baseline_start = now - timedelta(
        hours=config.HISTORICAL_BASELINE_HOURS
    )

    baseline_end = current_start

    # Bank metrics
    if payload.bank_name:
        bank_total, bank_failed, _ = failure_rate(
            db,
            merchant_id=merchant_id,
            start=current_start,
            end=now,
            payment_method=payload.payment_method,
            bank_name=payload.bank_name,
        )

        bank_total, bank_current_rate = _include_current(
            total=bank_total,
            failures=bank_failed,
            current_status=payload.status,
        )

        _, _, bank_baseline = failure_rate(
            db,
            merchant_id=merchant_id,
            start=baseline_start,
            end=baseline_end,
            payment_method=payload.payment_method,
            bank_name=payload.bank_name,
        )
    else:
        bank_total = 0
        bank_current_rate = None
        bank_baseline = None

    # Payment method metrics
    method_total, method_failed, _ = failure_rate(
        db,
        merchant_id=merchant_id,
        start=current_start,
        end=now,
        payment_method=payload.payment_method,
    )

    method_total, method_current_rate = _include_current(
        total=method_total,
        failures=method_failed,
        current_status=payload.status,
    )

    _, _, method_baseline = failure_rate(
        db,
        merchant_id=merchant_id,
        start=baseline_start,
        end=baseline_end,
        payment_method=payload.payment_method,
    )

    # Merchant metrics
    merchant_total, merchant_failed, _ = failure_rate(
        db,
        merchant_id=merchant_id,
        start=current_start,
        end=now,
    )

    merchant_total, merchant_current_rate = _include_current(
        total=merchant_total,
        failures=merchant_failed,
        current_status=payload.status,
    )

    _, _, merchant_baseline = failure_rate(
        db,
        merchant_id=merchant_id,
        start=baseline_start,
        end=baseline_end,
    )

    # Refund metrics
    refund_start = now - timedelta(
        hours=config.REFUND_CURRENT_WINDOW_HOURS
    )

    refund_total, refund_count, _ = refund_rate(
        db,
        merchant_id=merchant_id,
        start=refund_start,
        end=now,
    )

    refund_total += 1

    if payload.status == "REFUNDED":
        refund_count += 1

    refund_current_rate = refund_count / refund_total

    _, _, refund_baseline = refund_rate(
        db,
        merchant_id=merchant_id,
        start=baseline_start,
        end=refund_start,
    )

    # Duplicate payment pattern
    duplicate_count = 0
    captured_duplicates = 0

    if payload.customer_reference is not None:
        duplicate_start = now - timedelta(
            seconds=config.DUPLICATE_PAYMENT_WINDOW_SECONDS
        )

        previous_duplicates = count_transactions(
            db,
            merchant_id=merchant_id,
            start=duplicate_start,
            end=now,
            customer_reference=payload.customer_reference,
            amount=payload.amount,
        )

        previous_captured = count_transactions(
            db,
            merchant_id=merchant_id,
            start=duplicate_start,
            end=now,
            customer_reference=payload.customer_reference,
            amount=payload.amount,
            status="SUCCESS",
        )

        duplicate_count = previous_duplicates + 1
        captured_duplicates = previous_captured

        if payload.status == "SUCCESS":
            captured_duplicates += 1

    historical_risk = customer_historical_risk(
        db,
        merchant_id=merchant_id,
        customer_reference=payload.customer_reference,
        before=now,
    )

    return RiskFeatures(
        transaction_amount=payload.amount,
        customer_average_amount=average_amount,
        customer_amount_standard_deviation=amount_std,
        customer_history_count=history_count,
        transactions_last_60_seconds=tx_60,
        transactions_last_10_minutes=tx_10m,
        failed_attempts_last_10_minutes=failed_10m,

        # Device and location telemetry are not yet part of the
        # ingestion contract. They remain neutral rather than fabricated.
        is_new_device=False,
        unique_customers_from_device=0,
        high_risk_transactions_from_device=0,
        is_new_location=False,
        impossible_travel=False,

        customer_historical_risk_score=historical_risk,

        bank_failure_rate=bank_current_rate,
        historical_bank_failure_rate=bank_baseline,
        bank_transaction_sample=bank_total,

        payment_method_failure_rate=method_current_rate,
        historical_method_failure_rate=method_baseline,
        payment_method_transaction_sample=method_total,

        merchant_failure_rate=merchant_current_rate,
        historical_merchant_failure_rate=merchant_baseline,
        merchant_transaction_sample=merchant_total,

        refund_rate_1_hour=refund_current_rate,
        historical_refund_rate=refund_baseline,
        refund_transaction_sample=refund_total,

        duplicate_payments_last_30_seconds=duplicate_count,
        captured_duplicate_payments_last_30_seconds=captured_duplicates,
    )
