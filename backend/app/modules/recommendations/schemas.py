from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class RecommendationApprovalResponse(BaseModel):
    id: UUID
    incident_id: UUID
    approval_status: str
    status: str
    approved_by_user_id: UUID | None
    approved_by: str | None
    approved_at: datetime | None
    execution_mode: str


class RecommendationExecutionResponse(BaseModel):
    id: UUID
    incident_id: UUID
    status: str
    approval_status: str
    execution_mode: str
    execution_result: dict[str, Any] | None = None


class RecommendationDetailResponse(BaseModel):
    id: UUID
    incident_id: UUID
    investigation_id: UUID | None
    recommendation_type: str
    title: str
    rationale: str
    confidence_score: float | None
    proposed_action: dict[str, Any]
    expected_impact: dict[str, Any] | None
    status: str
    approval_required: bool
    approval_status: str
    execution_mode: str
    execution_result: dict[str, Any] | None = None
    model_provider: str | None
    model_name: str | None
    prompt_version: str | None
