from app.modules.ai.investigation.provider import (
    EvidenceGroundedDemoProvider,
    InvestigationProvider,
)
from app.modules.ai.investigation.schemas import (
    InvestigationContext,
    InvestigationOutput,
)


PROMPT_VERSION = "investigation-v1"


def run_ai_investigation(
    context: InvestigationContext,
    provider: InvestigationProvider | None = None,
) -> tuple[InvestigationOutput, InvestigationProvider]:
    selected = provider or EvidenceGroundedDemoProvider()

    result = selected.investigate(context)

    return result, selected
