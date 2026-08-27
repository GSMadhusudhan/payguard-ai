from pydantic import BaseModel, Field


class RiskFeatures(BaseModel):
    # Transaction / amount features
    transaction_amount: int = Field(ge=0)
    customer_average_amount: float | None = Field(default=None, ge=0)
    customer_amount_standard_deviation: float | None = Field(default=None, ge=0)
    customer_history_count: int = Field(default=0, ge=0)

    # Velocity / failure features
    transactions_last_60_seconds: int = Field(default=0, ge=0)
    transactions_last_10_minutes: int = Field(default=0, ge=0)
    failed_attempts_last_10_minutes: int = Field(default=0, ge=0)

    # Device features
    is_new_device: bool = False
    unique_customers_from_device: int = Field(default=0, ge=0)
    high_risk_transactions_from_device: int = Field(default=0, ge=0)

    # Location features
    is_new_location: bool = False
    impossible_travel: bool = False

    # Historical customer context
    customer_historical_risk_score: int | None = Field(default=None, ge=0, le=100)

    # Bank infrastructure features
    bank_failure_rate: float | None = Field(default=None, ge=0, le=1)
    historical_bank_failure_rate: float | None = Field(default=None, ge=0, le=1)
    bank_transaction_sample: int = Field(default=0, ge=0)

    # Payment-method infrastructure features
    payment_method_failure_rate: float | None = Field(default=None, ge=0, le=1)
    historical_method_failure_rate: float | None = Field(default=None, ge=0, le=1)
    payment_method_transaction_sample: int = Field(default=0, ge=0)

    # Merchant infrastructure features
    merchant_failure_rate: float | None = Field(default=None, ge=0, le=1)
    historical_merchant_failure_rate: float | None = Field(default=None, ge=0, le=1)
    merchant_transaction_sample: int = Field(default=0, ge=0)

    # Refund features
    refund_rate_1_hour: float | None = Field(default=None, ge=0, le=1)
    historical_refund_rate: float | None = Field(default=None, ge=0, le=1)
    refund_transaction_sample: int = Field(default=0, ge=0)

    # Duplicate-payment features
    duplicate_payments_last_30_seconds: int = Field(default=0, ge=0)
    captured_duplicate_payments_last_30_seconds: int = Field(default=0, ge=0)
