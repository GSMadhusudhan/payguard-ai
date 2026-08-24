from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RecommendationApprovalResponse(BaseModel):
    id: UUID
    incident_id: UUID
    approval_status: str
    status: str
    approved_by_user_id: UUID | None
    approved_by: str | None
    approved_at: datetime | None
    execution_mode: str
