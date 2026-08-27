from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_new_location(features: RiskFeatures) -> RuleResult:
    return result(
        rule_code=RuleCode.NEW_LOCATION,
        matched=features.is_new_location,
        score=5,
        group=RuleGroup.LOCATION,
        reason="Transaction originated from a location not previously observed for the customer.",
        evidence={"is_new_location": features.is_new_location},
        version=config.RULE_VERSION,
    )


def evaluate_rapid_location_change(features: RiskFeatures) -> RuleResult:
    return result(
        rule_code=RuleCode.RAPID_LOCATION_CHANGE,
        matched=features.impossible_travel,
        score=15,
        group=RuleGroup.LOCATION,
        reason="Transaction location changed faster than reasonable travel would permit.",
        evidence={"impossible_travel": features.impossible_travel},
        version=config.RULE_VERSION,
    )
