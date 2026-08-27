from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import (
    Incident,
    Investigation,
    Recommendation,
    Transaction,
    User,
)
from app.modules.investigations.service import investigate_incident
from app.modules.simulator.schemas import (
    SimulatorRunResponse,
    SimulatorScenario,
)
from app.modules.transactions.schemas import TransactionIngestRequest
from app.modules.transactions.service import ingest_transaction


SCENARIOS = [
    SimulatorScenario(
        id="normal_traffic",
        name="Normal Payment Traffic",
        description="Generates healthy baseline payment activity.",
    ),
    SimulatorScenario(
        id="bank_degradation",
        name="UPI Bank Degradation",
        description=(
            "Creates a sharp UPI failure spike concentrated in one bank."
        ),
    ),
]


_RUNS: dict[UUID, SimulatorRunResponse] = {}


def list_scenarios() -> list[SimulatorScenario]:
    return SCENARIOS


def get_run(simulation_id: UUID) -> SimulatorRunResponse | None:
    return _RUNS.get(simulation_id)


def _cleanup_previous_bank_degradation_run(
    db: Session,
    *,
    merchant_id,
) -> None:
    simulator_incidents = db.scalars(
        select(Incident).where(
            Incident.merchant_id == merchant_id,
            Incident.description.like(
                "%[SIMULATOR:bank_degradation:%"
            ),
        )
    ).all()

    incident_ids = [
        incident.id
        for incident in simulator_incidents
    ]

    if incident_ids:
        db.execute(
            delete(Recommendation).where(
                Recommendation.merchant_id == merchant_id,
                Recommendation.incident_id.in_(incident_ids),
            )
        )

        db.execute(
            delete(Investigation).where(
                Investigation.merchant_id == merchant_id,
                Investigation.incident_id.in_(incident_ids),
            )
        )

        db.execute(
            delete(Incident).where(
                Incident.id.in_(incident_ids)
            )
        )

    db.execute(
        delete(Transaction).where(
            Transaction.merchant_id == merchant_id,
            Transaction.provider == "SIMULATOR",
            Transaction.provider_payment_id.like(
                "sim_bankdeg_%"
            ),
        )
    )

    db.commit()


def _ingest(
    db: Session,
    *,
    current_user: User,
    simulation_id: UUID,
    sequence: int,
    amount: int,
    payment_method: str,
    status: str,
    bank_name: str,
    occurred_at: datetime,
    prefix: str,
) -> None:
    payload = TransactionIngestRequest(
        provider="SIMULATOR",
        provider_payment_id=(
            f"{prefix}_{simulation_id.hex}_{sequence:04d}"
        ),
        amount=amount,
        currency="INR",
        payment_method=payment_method,
        status=status,
        bank_name=bank_name,
        customer_reference=(
            f"{prefix}_customer_{simulation_id.hex}_{sequence:04d}"
        ),
        failure_code=(
            "BANK_TIMEOUT"
            if status == "FAILED"
            else None
        ),
        failure_reason=(
            f"{bank_name} payment timeout"
            if status == "FAILED"
            else None
        ),
        occurred_at=occurred_at,
    )

    ingest_transaction(
        db,
        payload,
        current_user,
    )


def run_normal_traffic(
    db: Session,
    *,
    current_user: User,
    transaction_count: int,
    duration_seconds: int,
) -> SimulatorRunResponse:
    simulation_id = uuid4()
    started_at = datetime.now(timezone.utc)

    for i in range(transaction_count):
        method = "UPI" if i % 2 == 0 else "CARD"

        bank = (
            "Healthy Bank"
            if method == "UPI"
            else "Card Network"
        )

        # Roughly 4% healthy demo failure rate.
        status = (
            "FAILED"
            if i % 25 == 0
            else "SUCCESS"
        )

        occurred_at = (
            started_at
            + timedelta(
                seconds=(
                    i
                    * duration_seconds
                    / transaction_count
                )
            )
        )

        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=i,
            amount=100_000,
            payment_method=method,
            status=status,
            bank_name=bank,
            occurred_at=occurred_at,
            prefix="sim_normal",
        )

    completed_at = datetime.now(timezone.utc)

    result = SimulatorRunResponse(
        simulation_id=simulation_id,
        scenario_id="normal_traffic",
        status="COMPLETED",
        transactions_generated=transaction_count,
        target_transactions=transaction_count,
        started_at=started_at,
        completed_at=completed_at,
    )

    _RUNS[simulation_id] = result
    return result


def run_bank_degradation(
    db: Session,
    *,
    current_user: User,
    transaction_count: int,
    duration_seconds: int,
) -> SimulatorRunResponse:
    simulation_id = uuid4()
    started_at = datetime.now(timezone.utc)

    _cleanup_previous_bank_degradation_run(
        db,
        merchant_id=current_user.merchant_id,
    )

    sequence = 0

    # --------------------------------------------------------
    # Historical baseline
    #
    # ABC Bank UPI:
    # 20 transactions
    # 1 failure
    # = 5% baseline
    # --------------------------------------------------------

    baseline_start = started_at - timedelta(hours=2)

    for i in range(20):
        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="UPI",
            status="FAILED" if i == 0 else "SUCCESS",
            bank_name="ABC Bank",
            occurred_at=(
                baseline_start
                + timedelta(seconds=i)
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # Other bank baseline remains healthy.
    for i in range(20):
        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="UPI",
            status="FAILED" if i == 0 else "SUCCESS",
            bank_name="XYZ Bank",
            occurred_at=(
                baseline_start
                + timedelta(seconds=30 + i)
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # Card baseline remains healthy.
    for i in range(10):
        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="CARD",
            status="SUCCESS",
            bank_name="Card Network",
            occurred_at=(
                baseline_start
                + timedelta(seconds=60 + i)
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # --------------------------------------------------------
    # Current ABC Bank UPI degradation
    #
    # 20 transactions
    # 6 failures
    # = 30% current failure rate
    #
    # Failed values total exactly:
    # 42,800,000 paise
    # = ₹4.28L
    # --------------------------------------------------------

    current_start = started_at - timedelta(minutes=5)

    failed_amounts = [
        7_000_000,
        7_000_000,
        7_000_000,
        7_000_000,
        7_000_000,
        7_800_000,
    ]

    for i in range(20):
        failed = i < 6

        amount = (
            failed_amounts[i]
            if failed
            else 100_000
        )

        # Put the final transaction at started_at so
        # the 20-transaction threshold is reached exactly.
        occurred_at = (
            started_at
            if i == 19
            else current_start + timedelta(seconds=i)
        )

        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=amount,
            payment_method="UPI",
            status="FAILED" if failed else "SUCCESS",
            bank_name="ABC Bank",
            occurred_at=occurred_at,
            prefix="sim_bankdeg",
        )
        sequence += 1

    # --------------------------------------------------------
    # Other-bank UPI remains normal at 5%.
    # --------------------------------------------------------

    for i in range(20):
        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="UPI",
            status="FAILED" if i == 0 else "SUCCESS",
            bank_name="XYZ Bank",
            occurred_at=(
                current_start
                + timedelta(seconds=30 + i)
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # --------------------------------------------------------
    # Cards remain normal.
    # --------------------------------------------------------

    for i in range(10):
        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="CARD",
            status="SUCCESS",
            bank_name="Card Network",
            occurred_at=(
                current_start
                + timedelta(seconds=60 + i)
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # Any requested transactions above the deterministic
    # 100-transaction core are safe healthy CARD traffic.
    while sequence < transaction_count:
        offset = sequence - 100

        _ingest(
            db,
            current_user=current_user,
            simulation_id=simulation_id,
            sequence=sequence,
            amount=100_000,
            payment_method="CARD",
            status="SUCCESS",
            bank_name="Card Network",
            occurred_at=(
                current_start
                + timedelta(
                    seconds=70 + offset
                )
            ),
            prefix="sim_bankdeg",
        )
        sequence += 1

    # --------------------------------------------------------
    # Retrieve incident created by the real ingestion pipeline.
    # --------------------------------------------------------

    incident = db.scalar(
        select(Incident)
        .where(
            Incident.merchant_id
            == current_user.merchant_id,
            Incident.incident_type
            == "BANK_DEGRADATION",
            Incident.payment_method == "UPI",
            Incident.bank_name == "ABC Bank",
            Incident.detected_at
            >= started_at - timedelta(minutes=10),
        )
        .order_by(
            Incident.detected_at.desc()
        )
        .limit(1)
    )

    if incident is None:
        raise RuntimeError(
            "Bank degradation scenario did not create an incident"
        )

    marker = (
        f"[SIMULATOR:bank_degradation:"
        f"{simulation_id}]"
    )

    if marker not in (incident.description or ""):
        incident.description = (
            f"{incident.description or ''} "
            f"{marker}"
        ).strip()
        db.commit()
        db.refresh(incident)

    # --------------------------------------------------------
    # Investigation -> recommendation.
    # --------------------------------------------------------

    investigation = investigate_incident(
        db,
        incident=incident,
    )

    recommendation = db.scalar(
        select(Recommendation)
        .where(
            Recommendation.merchant_id
            == current_user.merchant_id,
            Recommendation.incident_id
            == incident.id,
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .limit(1)
    )

    if recommendation is None:
        raise RuntimeError(
            "Simulator investigation did not create a recommendation"
        )

    completed_at = datetime.now(timezone.utc)

    result = SimulatorRunResponse(
        simulation_id=simulation_id,
        scenario_id="bank_degradation",
        status="COMPLETED",
        transactions_generated=sequence,
        target_transactions=transaction_count,
        started_at=started_at,
        completed_at=completed_at,
        incident_id=incident.id,
        investigation_id=investigation.id,
        recommendation_id=recommendation.id,
    )

    _RUNS[simulation_id] = result

    return result


def run_scenario(
    db: Session,
    *,
    current_user: User,
    scenario_id: str,
    transaction_count: int,
    duration_seconds: int,
) -> SimulatorRunResponse:
    if scenario_id == "normal_traffic":
        return run_normal_traffic(
            db,
            current_user=current_user,
            transaction_count=transaction_count,
            duration_seconds=duration_seconds,
        )

    if scenario_id == "bank_degradation":
        return run_bank_degradation(
            db,
            current_user=current_user,
            transaction_count=transaction_count,
            duration_seconds=duration_seconds,
        )

    raise ValueError(
        f"Unsupported simulator scenario: {scenario_id}"
    )
