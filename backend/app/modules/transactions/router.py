from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import require_analyst_or_admin
from app.modules.transactions.schemas import (
    TransactionIngestRequest,
    TransactionIngestResponse,
)
from app.modules.transactions.service import ingest_transaction

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post(
    "/ingest",
    response_model=TransactionIngestResponse,
    status_code=status.HTTP_200_OK,
)
def ingest(
    payload: TransactionIngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
) -> TransactionIngestResponse:
    return ingest_transaction(
        db=db,
        payload=payload,
        current_user=current_user,
    )
