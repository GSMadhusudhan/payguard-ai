from pydantic import BaseModel, Field

from app.modules.risk import config
from app.modules.risk.anomaly.statistics import (
    calculate_z_score,
    ratio_to_baseline,
)
from app.modules.risk.features.schemas import RiskFeatures


class AnomalySignal(BaseModel):
    signal_type: str
    observed_value: float
    baseline_value: float | None = None
    deviation: float | None = None
    anomaly_score: int = Field(ge=0, le=20)
    reason: str


def _z_score_points(value: float) -> int:
    absolute = abs(value)

    if absolute >= config.STRONG_Z_SCORE:
        return config.STRONG_Z_POINTS

    if absolute >= config.ELEVATED_Z_SCORE:
        return config.ELEVATED_Z_POINTS

    if absolute >= config.MODERATE_Z_SCORE:
        return config.MODERATE_Z_POINTS

    return 0


def _failure_ratio_points(value: float) -> int:
    if value >= config.STRONG_FAILURE_RATIO:
        return config.STRONG_FAILURE_ANOMALY_POINTS

    if value >= config.HIGH_FAILURE_RATIO:
        return config.HIGH_FAILURE_ANOMALY_POINTS

    if value >= config.MODERATE_FAILURE_RATIO:
        return config.MODERATE_FAILURE_ANOMALY_POINTS

    return 0


def detect_amount_anomaly(
    features: RiskFeatures,
) -> AnomalySignal | None:
    if features.customer_history_count < config.MIN_CUSTOMER_HISTORY_COUNT:
        return None

    z = calculate_z_score(
        current_value=float(features.transaction_amount),
        historical_mean=features.customer_average_amount,
        historical_standard_deviation=(
            features.customer_amount_standard_deviation
        ),
    )

    if z is None:
        return None

    score = _z_score_points(z)

    if score == 0:
        return None

    return AnomalySignal(
        signal_type="AMOUNT_Z_SCORE",
        observed_value=float(features.transaction_amount),
        baseline_value=features.customer_average_amount,
        deviation=z,
        anomaly_score=score,
        reason="Transaction amount deviates significantly from customer history.",
    )


def _failure_signal(
    *,
    signal_type: str,
    current: float | None,
    baseline: float | None,
    minimum_sample_met: bool,
) -> AnomalySignal | None:
    if not minimum_sample_met:
        return None

    ratio = ratio_to_baseline(current, baseline)

    if ratio is None:
        return None

    score = _failure_ratio_points(ratio)

    if score == 0:
        return None

    return AnomalySignal(
        signal_type=signal_type,
        observed_value=float(current),
        baseline_value=float(baseline),
        deviation=ratio,
        anomaly_score=score,
        reason="Failure rate is materially above its historical baseline.",
    )


def detect_bank_failure_anomaly(
    features: RiskFeatures,
) -> AnomalySignal | None:
    return _failure_signal(
        signal_type="BANK_FAILURE_SPIKE",
        current=features.bank_failure_rate,
        baseline=features.historical_bank_failure_rate,
        minimum_sample_met=(
            features.bank_transaction_sample
            >= config.BANK_MIN_SAMPLE_SIZE
        ),
    )


def detect_payment_method_failure_anomaly(
    features: RiskFeatures,
) -> AnomalySignal | None:
    return _failure_signal(
        signal_type="PAYMENT_METHOD_FAILURE_SPIKE",
        current=features.payment_method_failure_rate,
        baseline=features.historical_method_failure_rate,
        minimum_sample_met=(
            features.payment_method_transaction_sample
            >= config.METHOD_MIN_SAMPLE_SIZE
        ),
    )


def detect_merchant_failure_anomaly(
    features: RiskFeatures,
) -> AnomalySignal | None:
    return _failure_signal(
        signal_type="MERCHANT_FAILURE_SPIKE",
        current=features.merchant_failure_rate,
        baseline=features.historical_merchant_failure_rate,
        minimum_sample_met=(
            features.merchant_transaction_sample
            >= config.MERCHANT_MIN_SAMPLE_SIZE
        ),
    )
