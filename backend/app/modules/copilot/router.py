from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import require_analyst_or_admin
from app.modules.copilot.schemas import (
    CopilotQueryRequest,
    CopilotQueryResponse,
)
from app.modules.copilot.service import answer_copilot_query


router = APIRouter(
    prefix="/copilot",
    tags=["Copilot"],
)


@router.post(
    "/query",
    response_model=CopilotQueryResponse,
    status_code=status.HTTP_200_OK,
)
def query_copilot(
    payload: CopilotQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> CopilotQueryResponse:
    return answer_copilot_query(
        db,
        payload=payload,
        current_user=current_user,
    )
