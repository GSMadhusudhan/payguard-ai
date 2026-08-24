from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    __table_args__ = (
        Index(
            "ix_recommendations_merchant_status",
            "merchant_id",
            "status",
        ),
        Index(
            "ix_recommendations_incident_created_at",
            "incident_id",
            "created_at",
        ),
        Index(
            "ix_recommendations_approval_status",
            "approval_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    merchant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("merchants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    incident_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    investigation_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("investigations.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    recommendation_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    rationale: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    confidence_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    proposed_action: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    expected_impact: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        default="PROPOSED",
        nullable=False,
    )

    approval_required: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    approval_status: Mapped[str] = mapped_column(
        String(32),
        default="PENDING",
        nullable=False,
    )

    approved_by_user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
            name="fk_recommendations_approved_by_user_id_users",
        ),
        nullable=True,
        index=True,
    )

    approved_by: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    execution_mode: Mapped[str] = mapped_column(
        String(32),
        default="SIMULATED",
        nullable=False,
    )

    execution_result: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    model_provider: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    model_name: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    prompt_version: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
