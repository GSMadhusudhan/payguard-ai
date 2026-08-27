from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_high_velocity(features: RiskFeatures) -> RuleResult:
    return result(
        rule_code=RuleCode.HIGH_VELOCITY,
        matched=features.transactions_last_60_seconds >= config.HIGH_VELOCITY_THRESHOLD,
        score=20,
        group=RuleGroup.VELOCITY,
        reason="At least 5 transactions occurred within 60 seconds.",
        evidence={
            "transactions_last_60_seconds": features.transactions_last_60_seconds,
            "threshold": config.HIGH_VELOCITY_THRESHOLD,
            "window_seconds": 60,
        },
        version=config.RULE_VERSION,
    )


def evaluate_extreme_velocity(features: RiskFeatures) -> RuleResult:
    return result(
        rule_code=RuleCode.EXTREME_VELOCITY,
        matched=features.transactions_last_60_seconds >= config.EXTREME_VELOCITY_THRESHOLD,
        score=30,
        group=RuleGroup.VELOCITY,
        reason="At least 10 transactions occurred within 60 seconds.",
        evidence={
            "transactions_last_60_seconds": features.transactions_last_60_seconds,
            "threshold": config.EXTREME_VELOCITY_THRESHOLD,
            "window_seconds": 60,
        },
        version=config.RULE_VERSION,
    )
