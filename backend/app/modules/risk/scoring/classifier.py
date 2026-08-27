from app.modules.risk.constants import RiskLevel, TOTAL_SCORE_CAP


def classify_risk(score: int) -> RiskLevel:
    score = max(0, min(score, TOTAL_SCORE_CAP))

    if score >= 80:
        return RiskLevel.CRITICAL
    if score >= 60:
        return RiskLevel.HIGH
    if score >= 30:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW
