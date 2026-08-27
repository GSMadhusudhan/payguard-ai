from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_high_amount(features: RiskFeatures) -> RuleResult:
    eligible = (
        features.customer_history_count >= config.MIN_CUSTOMER_HISTORY_COUNT
        and features.customer_average_amount is not None
        and features.customer_average_amount > 0
    )
    ratio = (
        features.transaction_amount / features.customer_average_amount
        if eligible
        else None
    )
    matched = bool(
        eligible
        and ratio is not None
        and ratio >= config.HIGH_AMOUNT_MULTIPLIER
    )

    return result(
        rule_code=RuleCode.HIGH_AMOUNT,
        matched=matched,
        score=15,
        group=RuleGroup.AMOUNT,
        reason="Transaction amount is at least 5x the customer's historical average.",
        evidence={
            "transaction_amount": features.transaction_amount,
            "customer_average_amount": features.customer_average_amount,
            "customer_history_count": features.customer_history_count,
            "amount_ratio": ratio,
        },
        version=config.RULE_VERSION,
    )


def evaluate_extreme_amount(features: RiskFeatures) -> RuleResult:
    eligible = (
        features.customer_history_count >= config.MIN_CUSTOMER_HISTORY_COUNT
        and features.customer_average_amount is not None
        and features.customer_average_amount > 0
    )
    ratio = (
        features.transaction_amount / features.customer_average_amount
        if eligible
        else None
    )
    matched = bool(
        eligible
        and ratio is not None
        and ratio >= config.EXTREME_AMOUNT_MULTIPLIER
    )

    return result(
        rule_code=RuleCode.EXTREME_AMOUNT,
        matched=matched,
        score=25,
        group=RuleGroup.AMOUNT,
        reason="Transaction amount is at least 10x the customer's historical average.",
        evidence={
            "transaction_amount": features.transaction_amount,
            "customer_average_amount": features.customer_average_amount,
            "customer_history_count": features.customer_history_count,
            "amount_ratio": ratio,
        },
        version=config.RULE_VERSION,
    )
