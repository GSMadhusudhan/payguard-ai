from typing import Any

from pydantic import BaseModel, Field


class InvestigationContext(BaseModel):
    incident_id: str
    incident_type: str
    severity: str
    status: str
    risk_score: int

    payment_method: str | None = None
    bank_name: str | None = None

    baseline_failure_rate: float | None = None
    current_failure_rate: float | None = None

    affected_transactions: int | None = None
    failed_transactions: int | None = None
    revenue_at_risk: int | None = None

    evidence: dict[str, Any] = Field(default_factory=dict)


class InvestigationOutput(BaseModel):
    summary: str
    likely_root_cause: str
    confidence: float = Field(ge=0.0, le=1.0)

    evidence: list[str] = Field(default_factory=list)
    alternative_explanations: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    recommended_next_checks: list[str] = Field(default_factory=list)
