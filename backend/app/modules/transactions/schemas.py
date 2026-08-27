from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TransactionIngestRequest(BaseModel):
    provider: str = Field(min_length=2, max_length=32)
    provider_payment_id: str = Field(min_length=1, max_length=128)
    amount: int = Field(gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    payment_method: str = Field(min_length=2, max_length=32)
    status: str = Field(min_length=2, max_length=32)
    bank_name: str | None = Field(default=None, max_length=120)
    customer_reference: str | None = Field(default=None, max_length=128)
    failure_code: str | None = Field(default=None, max_length=100)
    failure_reason: str | None = Field(default=None, max_length=500)
    occurred_at: datetime

    @field_validator("provider", "currency", "payment_method", "status")
    @classmethod
    def normalize_uppercase_fields(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("provider_payment_id")
    @classmethod
    def normalize_payment_id(cls, value: str) -> str:
        return value.strip()


class TransactionIngestResponse(BaseModel):
    id: UUID
    provider_payment_id: str
    amount: int
    currency: str
    payment_method: str
    status: str
    risk_score: int
    risk_level: str
    duplicate: bool
    occurred_at: datetime
