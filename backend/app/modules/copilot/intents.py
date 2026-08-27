from enum import StrEnum


class CopilotIntent(StrEnum):
    DASHBOARD_SUMMARY = "DASHBOARD_SUMMARY"
    INCIDENT_SUMMARY = "INCIDENT_SUMMARY"
    INCIDENT_EXPLANATION = "INCIDENT_EXPLANATION"
    TRANSACTION_EXPLANATION = "TRANSACTION_EXPLANATION"
    RISK_TREND = "RISK_TREND"
    PAYMENT_METHOD_ANALYSIS = "PAYMENT_METHOD_ANALYSIS"
    BANK_ANALYSIS = "BANK_ANALYSIS"
    MERCHANT_ANALYSIS = "MERCHANT_ANALYSIS"
    REVENUE_AT_RISK = "REVENUE_AT_RISK"
    ALERT_SUMMARY = "ALERT_SUMMARY"
    GENERAL_RISK_QUESTION = "GENERAL_RISK_QUESTION"


PAYMENT_METHODS = {
    "UPI",
    "CARD",
    "NETBANKING",
    "WALLET",
}


def classify_intent(question: str) -> CopilotIntent:
    normalized = question.lower()

    if (
        "revenue at risk" in normalized
        or "revenue" in normalized
        or "financial exposure" in normalized
    ):
        return CopilotIntent.REVENUE_AT_RISK

    if (
        "upi" in normalized
        or "card" in normalized
        or "payment method" in normalized
        or "payments failing" in normalized
        or "payment failing" in normalized
    ):
        return CopilotIntent.PAYMENT_METHOD_ANALYSIS

    if "bank" in normalized:
        return CopilotIntent.BANK_ANALYSIS

    if (
        "incident" in normalized
        and (
            "why" in normalized
            or "explain" in normalized
        )
    ):
        return CopilotIntent.INCIDENT_EXPLANATION

    if "incident" in normalized:
        return CopilotIntent.INCIDENT_SUMMARY

    if "transaction" in normalized:
        return CopilotIntent.TRANSACTION_EXPLANATION

    if "trend" in normalized:
        return CopilotIntent.RISK_TREND

    if "dashboard" in normalized or "summary" in normalized:
        return CopilotIntent.DASHBOARD_SUMMARY

    return CopilotIntent.GENERAL_RISK_QUESTION


def extract_payment_method(
    question: str,
) -> str | None:
    normalized = question.upper()

    for method in PAYMENT_METHODS:
        if method in normalized:
            return method

    return None
