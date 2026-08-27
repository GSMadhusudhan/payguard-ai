from abc import ABC, abstractmethod

from app.modules.ai.investigation.schemas import (
    InvestigationContext,
    InvestigationOutput,
)


class InvestigationProvider(ABC):
    provider_name = "unknown"
    model_name = "unknown"

    @abstractmethod
    def investigate(
        self,
        context: InvestigationContext,
    ) -> InvestigationOutput:
        raise NotImplementedError


class EvidenceGroundedDemoProvider(InvestigationProvider):
    """
    Deterministic fallback used when an external AI provider is
    unavailable.

    It only summarizes supplied PayGuard evidence and never changes
    risk scores, transaction facts, or financial calculations.
    """

    provider_name = "payguard"
    model_name = "evidence-grounded-demo-v1"

    def investigate(
        self,
        context: InvestigationContext,
    ) -> InvestigationOutput:
        evidence: list[str] = []
        uncertainties: list[str] = []
        alternatives: list[str] = []

        if (
            context.current_failure_rate is not None
            and context.baseline_failure_rate is not None
        ):
            evidence.append(
                f"Observed failure rate increased from "
                f"{context.baseline_failure_rate:.1%} to "
                f"{context.current_failure_rate:.1%}."
            )

        if (
            context.failed_transactions is not None
            and context.affected_transactions is not None
        ):
            evidence.append(
                f"{context.failed_transactions} of "
                f"{context.affected_transactions} affected "
                f"transactions failed."
            )

        if context.bank_name and context.payment_method:
            evidence.append(
                f"The incident is correlated with "
                f"{context.bank_name} "
                f"{context.payment_method} traffic."
            )

        if context.revenue_at_risk is not None:
            evidence.append(
                f"PayGuard's deterministic backend calculated "
                f"revenue at risk as "
                f"{context.revenue_at_risk} paise."
            )

        if context.incident_type == "BANK_DEGRADATION":
            root_cause = (
                f"Possible {context.payment_method or 'payment'} "
                f"degradation associated with "
                f"{context.bank_name or 'the affected bank'}."
            )

            summary = (
                f"A significant payment failure spike is "
                f"concentrated in "
                f"{context.bank_name or 'the affected bank'} "
                f"{context.payment_method or ''} traffic."
            ).strip()

            alternatives = [
                "A broader payment-provider degradation may be contributing.",
                "A merchant integration issue remains possible until independent health signals are checked.",
            ]

            uncertainties = [
                "Provider-side service health is not available in the supplied evidence.",
                "Card-traffic comparison is not available in the supplied evidence.",
            ]

            recommended = [
                "Check the affected bank or provider service-health signals.",
                "Compare card and other payment-method failure rates.",
                "Review dominant failure codes for the affected traffic.",
            ]

            confidence = 0.90

        else:
            root_cause = (
                "Current evidence indicates unusual payment behavior, "
                "but the root cause is not yet confirmed."
            )

            summary = (
                "PayGuard detected a risk incident requiring "
                "additional investigation."
            )

            alternatives = [
                "Customer behavior may explain some of the observed signals.",
                "Infrastructure degradation may be contributing.",
            ]

            uncertainties = [
                "The supplied evidence does not uniquely identify a root cause."
            ]

            recommended = [
                "Review additional transaction and infrastructure evidence."
            ]

            confidence = 0.65

        return InvestigationOutput(
            summary=summary,
            likely_root_cause=root_cause,
            confidence=confidence,
            evidence=evidence,
            alternative_explanations=alternatives,
            uncertainties=uncertainties,
            recommended_next_checks=recommended,
        )
