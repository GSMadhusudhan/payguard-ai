from sqlalchemy.orm import Session

from app.modules.risk.anomaly.engine import (
    AnomalyEngineResult,
    evaluate_anomalies,
)
from app.modules.risk.features.extractor import extract_risk_features
from app.modules.risk.features.schemas import RiskFeatures
from app.modules.risk.rules.base import RuleEngineResult
from app.modules.risk.rules.engine import evaluate_rules
from app.modules.risk.scoring.engine import calculate_risk_score
from app.modules.risk.scoring.schemas import RiskEvaluationResult
from app.modules.transactions.schemas import TransactionIngestRequest


class RiskAssessment:
    def __init__(
        self,
        *,
        features: RiskFeatures,
        rules: RuleEngineResult,
        anomalies: AnomalyEngineResult,
        result: RiskEvaluationResult,
    ) -> None:
        self.features = features
        self.rules = rules
        self.anomalies = anomalies
        self.result = result


def evaluate_transaction_risk(
    db: Session,
    *,
    merchant_id,
    payload: TransactionIngestRequest,
) -> RiskAssessment:
    features = extract_risk_features(
        db,
        merchant_id=merchant_id,
        payload=payload,
    )

    rules = evaluate_rules(features)
    anomalies = evaluate_anomalies(features)

    result = calculate_risk_score(
        transaction_id=payload.provider_payment_id,
        rules=rules,
        anomaly_score=anomalies.anomaly_score,
        contextual_score=0,
    )

    return RiskAssessment(
        features=features,
        rules=rules,
        anomalies=anomalies,
        result=result,
    )
