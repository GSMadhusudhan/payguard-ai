from pydantic import BaseModel


class DashboardSummary(BaseModel):
    payment_health_score: int
    transactions_today: int
    successful_transactions_today: int
    failed_transactions_today: int
    success_rate: float
    failure_rate: float
    high_risk_transactions: int
    critical_risk_transactions: int
    open_incidents: int
    critical_incidents: int
    revenue_at_risk: int
    currency: str = "INR"
    active_alerts: int = 0


class DashboardSummaryEnvelope(BaseModel):
    data: DashboardSummary


class RiskDistributionItem(BaseModel):
    risk_level: str
    count: int


class RiskDistributionEnvelope(BaseModel):
    data: list[RiskDistributionItem]


class PaymentMethodPerformance(BaseModel):
    payment_method: str
    transaction_count: int
    success_rate: float
    failure_rate: float
    risk_score: int


class PaymentMethodEnvelope(BaseModel):
    data: list[PaymentMethodPerformance]
