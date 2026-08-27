from pydantic import BaseModel, Field

from app.modules.risk.constants import RiskLevel


class RiskFactor(BaseModel):
    factor_code: str
    score_contribution: int = Field(ge=0)
    reason: str | None = None


class RiskEvaluationResult(BaseModel):
    transaction_id: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: RiskLevel
    rule_score: int = Field(ge=0, le=70)
    anomaly_score: int = Field(ge=0, le=20)
    contextual_score: int = Field(ge=0, le=10)
    factors: list[RiskFactor] = Field(default_factory=list)
    model_version: str
