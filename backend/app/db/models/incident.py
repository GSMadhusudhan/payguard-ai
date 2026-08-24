from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    __table_args__ = (
        Index(
            "ix_incidents_merchant_status",
            "merchant_id",
            "status",
        ),
        Index(
            "ix_incidents_merchant_detected_at",
            "merchant_id",
            "detected_at",
        ),
        Index(
            "ix_incidents_type_severity",
            "incident_type",
            "severity",
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

    incident_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    severity: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        default="DETECTED",
        nullable=False,
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    payment_method: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    bank_name: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    baseline_failure_rate: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    current_failure_rate: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    affected_transactions: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    failed_transactions: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    revenue_at_risk: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
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
