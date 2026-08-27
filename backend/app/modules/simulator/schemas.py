from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SimulatorScenario(BaseModel):
    id: str
    name: str
    description: str


class SimulatorScenarioListResponse(BaseModel):
    data: list[SimulatorScenario]


class SimulatorRunRequest(BaseModel):
    transaction_count: int = Field(default=100, ge=100, le=1000)
    duration_seconds: int = Field(default=60, ge=10, le=600)


class SimulatorRunResponse(BaseModel):
    simulation_id: UUID
    scenario_id: str
    status: str
    transactions_generated: int
    target_transactions: int
    started_at: datetime
    completed_at: datetime | None = None
    incident_id: UUID | None = None
    investigation_id: UUID | None = None
    recommendation_id: UUID | None = None


class SimulatorRunEnvelope(BaseModel):
    data: SimulatorRunResponse
