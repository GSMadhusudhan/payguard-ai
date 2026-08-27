from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class Pagination(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class TransactionListItem(BaseModel):
    id: UUID
    external_payment_id: str
    amount: int
    currency: str
    payment_method: str
    bank: str | None = None
    status: str
    risk_score: int | None = None
    risk_level: str | None = None
    occurred_at: datetime


class TransactionListEnvelope(BaseModel):
    data: list[TransactionListItem]
    pagination: Pagination


class TransactionDetail(BaseModel):
    id: UUID
    merchant_id: UUID
    external_payment_id: str
    payment_provider: str
    amount: int
    currency: str
    payment_method: str
    bank: str | None = None
    status: str
    failure_code: str | None = None
    failure_reason: str | None = None
    customer_reference: str | None = None
    occurred_at: datetime
    risk: dict[str, Any]


class TransactionDetailEnvelope(BaseModel):
    data: TransactionDetail


class IncidentListItem(BaseModel):
    id: UUID
    incident_number: str
    title: str
    incident_type: str
    severity: str
    status: str
    risk_score: int | None = None
    affected_transaction_count: int
    failed_transaction_count: int
    revenue_at_risk: int
    currency: str = "INR"
    payment_method: str | None = None
    bank: str | None = None
    detected_at: datetime


class IncidentListEnvelope(BaseModel):
    data: list[IncidentListItem]
    pagination: Pagination


class IncidentDetail(BaseModel):
    id: UUID
    incident_number: str
    title: str
    description: str | None = None
    incident_type: str
    severity: str
    status: str
    risk_score: int | None = None
    confidence_score: float | None = None
    affected_transaction_count: int
    failed_transaction_count: int
    affected_payment_value: int
    revenue_at_risk: int
    currency: str = "INR"
    primary_payment_method: str | None = None
    primary_bank: str | None = None
    baseline_failure_rate: float | None = None
    current_failure_rate: float | None = None
    detected_at: datetime
    resolved_at: datetime | None = None


class IncidentDetailEnvelope(BaseModel):
    data: IncidentDetail


class InvestigationListItem(BaseModel):
    id: UUID
    incident_id: UUID
    status: str
    summary: str | None = None
    likely_root_cause: str | None = None
    confidence_score: float | None = None
    model_name: str | None = None
    prompt_version: str | None = None
    created_at: datetime


class InvestigationListEnvelope(BaseModel):
    data: list[InvestigationListItem]


class InvestigationDetail(BaseModel):
    id: UUID
    incident_id: UUID
    status: str
    summary: str | None = None
    likely_root_cause: str | None = None
    confidence_score: float | None = None
    evidence: list[Any] = Field(default_factory=list)
    alternative_explanations: list[Any] = Field(
        default_factory=list
    )
    uncertainties: list[Any] = Field(
        default_factory=list
    )
    recommended_next_checks: list[Any] = Field(
        default_factory=list
    )
    provider: str | None = None
    model_name: str | None = None
    prompt_version: str | None = None
    created_at: datetime


class InvestigationDetailEnvelope(BaseModel):
    data: InvestigationDetail


class RecommendationListItem(BaseModel):
    id: UUID
    incident_id: UUID
    investigation_id: UUID | None = None
    recommendation_type: str
    title: str
    rationale: str | None = None
    confidence_score: float | None = None
    proposed_action: dict[str, Any] = Field(
        default_factory=dict
    )
    expected_impact: dict[str, Any] = Field(
        default_factory=dict
    )
    requires_approval: bool
    approval_status: str
    status: str
    execution_mode: str
    execution_result: dict[str, Any] | None = None
    approved_by: str | None = None
    approved_at: datetime | None = None
    created_at: datetime


class RecommendationListEnvelope(BaseModel):
    data: list[RecommendationListItem]


class RecommendationDetailEnvelope(BaseModel):
    data: RecommendationListItem
