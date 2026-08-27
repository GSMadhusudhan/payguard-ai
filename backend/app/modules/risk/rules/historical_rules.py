from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_customer_risk_history(features: RiskFeatures) -> RuleResult:
    historical = features.customer_historical_risk_score

    if historical is not None and historical >= config.EXTREME_CUSTOMER_RISK_THRESHOLD:
        score = 15
    else:
        score = 10

    return result(
        rule_code=RuleCode.CUSTOMER_RISK_HISTORY,
        matched=bool(
            historical is not None
            and historical >= config.HIGH_CUSTOMER_RISK_THRESHOLD
        ),
        score=score,
        group=RuleGroup.HISTORICAL,
        reason="Customer historical risk is elevated and contributes contextual evidence.",
        evidence={
            "customer_historical_risk_score": historical,
            "high_threshold": config.HIGH_CUSTOMER_RISK_THRESHOLD,
            "extreme_threshold": config.EXTREME_CUSTOMER_RISK_THRESHOLD,
        },
        version=config.RULE_VERSION,
    )
