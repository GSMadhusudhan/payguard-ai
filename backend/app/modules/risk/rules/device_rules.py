from app.modules.risk import config
from app.modules.risk.constants import RuleCode, RuleGroup
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleResult, result


def evaluate_new_device(features: RiskFeatures) -> RuleResult:
    return result(
        rule_code=RuleCode.NEW_DEVICE,
        matched=features.is_new_device,
        score=10,
        group=RuleGroup.DEVICE,
        reason="Device has not previously been observed for this customer.",
        evidence={"is_new_device": features.is_new_device},
        version=config.RULE_VERSION,
    )


def evaluate_device_multi_customer(features: RiskFeatures) -> RuleResult:
    customers = features.unique_customers_from_device

    if customers >= config.DEVICE_EXTREME_MULTI_CUSTOMER_THRESHOLD:
        score = 30
    else:
        score = 20

    return result(
        rule_code=RuleCode.DEVICE_MULTI_CUSTOMER,
        matched=customers >= config.DEVICE_MULTI_CUSTOMER_THRESHOLD,
        score=score,
        group=RuleGroup.DEVICE,
        reason=(
            "The device is associated with an unusually large number of customers; "
            "this is suspicious behavior, not proof of fraud."
        ),
        evidence={
            "unique_customers_from_device": customers,
            "high_threshold": config.DEVICE_MULTI_CUSTOMER_THRESHOLD,
            "extreme_threshold": config.DEVICE_EXTREME_MULTI_CUSTOMER_THRESHOLD,
        },
        version=config.RULE_VERSION,
    )
