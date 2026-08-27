from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_repeated_failures(features: RiskFeatures) -> RuleResult:
    attempts = features.failed_attempts_last_10_minutes

    if attempts >= config.EXTREME_FAILURE_THRESHOLD:
        score = 25
    else:
        score = 15

    return result(
        rule_code=RuleCode.REPEATED_FAILURES,
        matched=attempts >= config.HIGH_FAILURE_THRESHOLD,
        score=score,
        group=RuleGroup.FAILURE,
        reason="Repeated payment failures detected within the last 10 minutes.",
        evidence={
            "failed_attempts_last_10_minutes": attempts,
            "high_threshold": config.HIGH_FAILURE_THRESHOLD,
            "extreme_threshold": config.EXTREME_FAILURE_THRESHOLD,
        },
        version=config.RULE_VERSION,
    )


def evaluate_refund_pattern(features: RiskFeatures) -> RuleResult:
    current = features.refund_rate_1_hour
    baseline = features.historical_refund_rate
    eligible = (
        current is not None
        and baseline is not None
        and baseline > 0
        and features.refund_transaction_sample >= config.REFUND_MIN_SAMPLE_SIZE
    )

    matched = bool(
        eligible
        and current >= baseline * config.REFUND_FAILURE_MULTIPLIER
    )

    return result(
        rule_code=RuleCode.REFUND_PATTERN,
        matched=matched,
        score=15,
        group=RuleGroup.REFUND,
        reason="Refund rate is at least 3x its historical baseline.",
        evidence={
            "refund_rate_1_hour": current,
            "historical_refund_rate": baseline,
            "sample_size": features.refund_transaction_sample,
        },
        version=config.RULE_VERSION,
    )


def evaluate_duplicate_payment_pattern(features: RiskFeatures) -> RuleResult:
    count = features.duplicate_payments_last_30_seconds
    captured = features.captured_duplicate_payments_last_30_seconds

    return result(
        rule_code=RuleCode.DUPLICATE_PAYMENT_PATTERN,
        matched=count >= config.DUPLICATE_PAYMENT_COUNT,
        score=15,
        group=RuleGroup.DUPLICATE,
        reason=(
            "Multiple matching payments occurred in a short window; "
            "captured duplicates require higher operational priority."
        ),
        evidence={
            "duplicate_payments_last_30_seconds": count,
            "captured_duplicate_payments_last_30_seconds": captured,
            "threshold": config.DUPLICATE_PAYMENT_COUNT,
            "window_seconds": config.DUPLICATE_PAYMENT_WINDOW_SECONDS,
        },
        version=config.RULE_VERSION,
    )
