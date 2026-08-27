from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import require_admin
from app.modules.simulator.schemas import (
    SimulatorRunEnvelope,
    SimulatorRunRequest,
    SimulatorScenarioListResponse,
)
from app.modules.simulator.service import (
    get_run,
    list_scenarios,
    run_scenario,
)


router = APIRouter(
    prefix="/simulator",
    tags=["Simulator"],
)


@router.get(
    "/scenarios",
    response_model=SimulatorScenarioListResponse,
)
def scenarios(
    current_user: User = Depends(require_admin),
) -> SimulatorScenarioListResponse:
    return SimulatorScenarioListResponse(
        data=list_scenarios()
    )


@router.post(
    "/scenarios/{scenario_id}/run",
    response_model=SimulatorRunEnvelope,
    status_code=status.HTTP_202_ACCEPTED,
)
def run(
    scenario_id: str,
    payload: SimulatorRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SimulatorRunEnvelope:
    try:
        result = run_scenario(
            db,
            current_user=current_user,
            scenario_id=scenario_id,
            transaction_count=payload.transaction_count,
            duration_seconds=payload.duration_seconds,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from None

    return SimulatorRunEnvelope(data=result)


@router.get(
    "/runs/{simulation_id}",
    response_model=SimulatorRunEnvelope,
)
def run_status(
    simulation_id: UUID,
    current_user: User = Depends(require_admin),
) -> SimulatorRunEnvelope:
    result = get_run(simulation_id)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation run not found",
        )

    return SimulatorRunEnvelope(data=result)
