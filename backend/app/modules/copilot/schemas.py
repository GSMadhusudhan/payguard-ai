from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.copilot.intents import CopilotIntent


class CopilotQueryRequest(BaseModel):
    conversation_id: UUID | None = None
    question: str = Field(min_length=2, max_length=1000)


class CopilotEvidence(BaseModel):
    label: str
    value: str


class CopilotIncidentReference(BaseModel):
    id: UUID
    incident_number: str


class CopilotTransactionReference(BaseModel):
    id: UUID


class CopilotQueryResponse(BaseModel):
    conversation_id: UUID
    message_id: UUID
    intent: CopilotIntent
    answer: str
    referenced_incidents: list[CopilotIncidentReference] = Field(
        default_factory=list
    )
    referenced_transactions: list[CopilotTransactionReference] = Field(
        default_factory=list
    )
    evidence: list[CopilotEvidence] = Field(default_factory=list)
    generated_at: datetime
