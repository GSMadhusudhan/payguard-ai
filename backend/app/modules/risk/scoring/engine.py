from app.modules.risk.constants import (
    ANOMALY_SCORE_CAP,
    CONTEXTUAL_SCORE_CAP,
    RISK_MODEL_VERSION,
    TOTAL_SCORE_CAP,
)
from app.modules.risk.rules.base import RuleEngineResult
from app.modules.risk.scoring.classifier import classify_risk
from app.modules.risk.scoring.schemas import RiskEvaluationResult, RiskFactor


def calculate_risk_score(
    *,
    transaction_id: str,
    rules: RuleEngineResult,
    anomaly_score: int = 0,
    contextual_score: int = 0,
) -> RiskEvaluationResult:
    anomaly_score = max(0, min(anomaly_score, ANOMALY_SCORE_CAP))
    contextual_score = max(0, min(contextual_score, CONTEXTUAL_SCORE_CAP))

    total = min(
        rules.rule_score + anomaly_score + contextual_score,
        TOTAL_SCORE_CAP,
    )

    factors = [
        RiskFactor(
            factor_code=item.rule_code.value,
            score_contribution=item.score,
            reason=item.reason,
        )
        for item in rules.contributing_rules
    ]

    return RiskEvaluationResult(
        transaction_id=transaction_id,
        risk_score=total,
        risk_level=classify_risk(total),
        rule_score=rules.rule_score,
        anomaly_score=anomaly_score,
        contextual_score=contextual_score,
        factors=factors,
        model_version=RISK_MODEL_VERSION,
    )
