from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_bank_failure_spike(features: RiskFeatures) -> RuleResult:
    current = features.bank_failure_rate
    baseline = features.historical_bank_failure_rate
    eligible = (
        current is not None
        and baseline is not None
        and baseline > 0
        and features.bank_transaction_sample >= config.BANK_MIN_SAMPLE_SIZE
    )

    extreme = bool(
        eligible
        and current >= baseline * config.BANK_EXTREME_FAILURE_MULTIPLIER
    )
    matched = bool(
        extreme
        or (
            eligible
            and current > baseline * config.BANK_FAILURE_MULTIPLIER
        )
    )

    return result(
        rule_code=RuleCode.BANK_FAILURE_SPIKE,
        matched=matched,
        score=25 if extreme else 15,
        group=RuleGroup.INFRASTRUCTURE,
        reason="Bank failure rate is materially above its historical baseline.",
        evidence={
            "current_bank_failure_rate": current,
            "historical_bank_failure_rate": baseline,
            "sample_size": features.bank_transaction_sample,
            "ratio": current / baseline if eligible else None,
        },
        version=config.RULE_VERSION,
    )


def evaluate_payment_method_failure_spike(features: RiskFeatures) -> RuleResult:
    current = features.payment_method_failure_rate
    baseline = features.historical_method_failure_rate
    eligible = (
        current is not None
        and baseline is not None
        and baseline > 0
        and features.payment_method_transaction_sample >= config.METHOD_MIN_SAMPLE_SIZE
    )

    return result(
        rule_code=RuleCode.PAYMENT_METHOD_FAILURE_SPIKE,
        matched=bool(
            eligible
            and current >= baseline * config.METHOD_FAILURE_MULTIPLIER
        ),
        score=20,
        group=RuleGroup.INFRASTRUCTURE,
        reason="Payment-method failure rate is at least 3x its historical baseline.",
        evidence={
            "current_method_failure_rate": current,
            "historical_method_failure_rate": baseline,
            "sample_size": features.payment_method_transaction_sample,
            "ratio": current / baseline if eligible else None,
        },
        version=config.RULE_VERSION,
    )


def evaluate_merchant_failure_spike(features: RiskFeatures) -> RuleResult:
    current = features.merchant_failure_rate
    baseline = features.historical_merchant_failure_rate
    eligible = (
        current is not None
        and baseline is not None
        and baseline > 0
        and features.merchant_transaction_sample >= config.MERCHANT_MIN_SAMPLE_SIZE
    )

    return result(
        rule_code=RuleCode.MERCHANT_FAILURE_SPIKE,
        matched=bool(
            eligible
            and current >= baseline * config.MERCHANT_FAILURE_MULTIPLIER
        ),
        score=20,
        group=RuleGroup.INFRASTRUCTURE,
        reason="Merchant failure rate is at least 3x its historical baseline.",
        evidence={
            "merchant_failure_rate": current,
            "historical_merchant_failure_rate": baseline,
            "sample_size": features.merchant_transaction_sample,
            "ratio": current / baseline if eligible else None,
        },
        version=config.RULE_VERSION,
    )
