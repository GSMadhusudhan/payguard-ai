from app.modules.risk.constants import RULE_SCORE_CAP, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.amount_rules import (
    evaluate_extreme_amount,
    evaluate_high_amount,
)
from app.modules.risk.rules.base import RuleEngineResult, RuleResult
from app.modules.risk.rules.device_rules import (
    evaluate_device_multi_customer,
    evaluate_new_device,
)
from app.modules.risk.rules.failure_rules import (
    evaluate_duplicate_payment_pattern,
    evaluate_refund_pattern,
    evaluate_repeated_failures,
)
from app.modules.risk.rules.historical_rules import evaluate_customer_risk_history
from app.modules.risk.rules.infrastructure_rules import (
    evaluate_bank_failure_spike,
    evaluate_merchant_failure_spike,
    evaluate_payment_method_failure_spike,
)
from app.modules.risk.rules.location_rules import (
    evaluate_new_location,
    evaluate_rapid_location_change,
)
from app.modules.risk.rules.velocity_rules import (
    evaluate_extreme_velocity,
    evaluate_high_velocity,
)


def evaluate_rules(features: RiskFeatures) -> RuleEngineResult:
    results: list[RuleResult] = [
        evaluate_high_amount(features),
        evaluate_extreme_amount(features),
        evaluate_high_velocity(features),
        evaluate_extreme_velocity(features),
        evaluate_repeated_failures(features),
        evaluate_new_device(features),
        evaluate_device_multi_customer(features),
        evaluate_new_location(features),
        evaluate_rapid_location_change(features),
        evaluate_customer_risk_history(features),
        evaluate_bank_failure_spike(features),
        evaluate_payment_method_failure_spike(features),
        evaluate_merchant_failure_spike(features),
        evaluate_refund_pattern(features),
        evaluate_duplicate_payment_pattern(features),
    ]

    matched = [item for item in results if item.matched]

    strongest_by_group: dict[RuleGroup, RuleResult] = {}

    for item in matched:
        current = strongest_by_group.get(item.group)
        if current is None or item.score > current.score:
            strongest_by_group[item.group] = item

    contributing = list(strongest_by_group.values())
    rule_score = min(
        sum(item.score for item in contributing),
        RULE_SCORE_CAP,
    )

    return RuleEngineResult(
        rule_score=rule_score,
        matched_rules=matched,
        contributing_rules=contributing,
    )
