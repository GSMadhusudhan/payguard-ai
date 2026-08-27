from typing import Any

from pydantic import BaseModel, Field

from app.modules.risk.constants import RiskLevel, RuleCode, RuleGroup


class RuleResult(BaseModel):
    rule_code: RuleCode
    matched: bool
    score: int = Field(ge=0)
    severity: RiskLevel
    group: RuleGroup
    reason: str
    evidence: dict[str, Any] = Field(default_factory=dict)
    version: int = Field(ge=1)


class RuleEngineResult(BaseModel):
    rule_score: int = Field(ge=0, le=70)
    matched_rules: list[RuleResult] = Field(default_factory=list)
    contributing_rules: list[RuleResult] = Field(default_factory=list)


def rule_severity(score: int) -> RiskLevel:
    if score >= 30:
        return RiskLevel.CRITICAL
    if score >= 20:
        return RiskLevel.HIGH
    if score >= 10:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def result(
    *,
    rule_code: RuleCode,
    matched: bool,
    score: int,
    group: RuleGroup,
    reason: str,
    evidence: dict[str, Any],
    version: int,
) -> RuleResult:
    contribution = score if matched else 0
    return RuleResult(
        rule_code=rule_code,
        matched=matched,
        score=contribution,
        severity=rule_severity(contribution),
        group=group,
        reason=reason,
        evidence=evidence,
        version=version,
    )
