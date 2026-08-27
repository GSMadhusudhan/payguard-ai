from pydantic import BaseModel, Field

from app.modules.risk.constants import ANOMALY_SCORE_CAP
from app.modules.risk.anomaly.detectors import (
    AnomalySignal,
    detect_amount_anomaly,
    detect_bank_failure_anomaly,
    detect_merchant_failure_anomaly,
    detect_payment_method_failure_anomaly,
)
from app.modules.risk.features.schemas import RiskFeatures


class AnomalyEngineResult(BaseModel):
    anomaly_score: int = Field(ge=0, le=20)
    signals: list[AnomalySignal] = Field(default_factory=list)
    unavailable_detectors: list[str] = Field(default_factory=list)


def evaluate_anomalies(
    features: RiskFeatures,
) -> AnomalyEngineResult:
    detectors = [
        ("AMOUNT_Z_SCORE", detect_amount_anomaly),
        ("BANK_FAILURE_SPIKE", detect_bank_failure_anomaly),
        (
            "PAYMENT_METHOD_FAILURE_SPIKE",
            detect_payment_method_failure_anomaly,
        ),
        ("MERCHANT_FAILURE_SPIKE", detect_merchant_failure_anomaly),
    ]

    signals: list[AnomalySignal] = []
    unavailable: list[str] = []

    for name, detector in detectors:
        try:
            signal = detector(features)

            if signal is not None:
                signals.append(signal)

        except Exception:
            unavailable.append(name)

    total = min(
        sum(signal.anomaly_score for signal in signals),
        ANOMALY_SCORE_CAP,
    )

    return AnomalyEngineResult(
        anomaly_score=total,
        signals=signals,
        unavailable_detectors=unavailable,
    )
