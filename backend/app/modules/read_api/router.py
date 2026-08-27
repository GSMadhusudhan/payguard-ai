from datetime import datetime
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import (
    require_analyst_or_admin,
)
from app.modules.read_api.schemas import (
    IncidentDetailEnvelope,
    IncidentListEnvelope,
    InvestigationDetailEnvelope,
    InvestigationListEnvelope,
    RecommendationDetailEnvelope,
    RecommendationListEnvelope,
    TransactionDetailEnvelope,
    TransactionListEnvelope,
)
from app.modules.read_api.service import (
    get_incident,
    get_investigation,
    get_recommendation,
    get_transaction,
    list_incidents,
    list_investigations,
    list_recommendations,
    list_transactions,
)


router = APIRouter(
    tags=["Frontend Read API"],
)


@router.get(
    "/transactions",
    response_model=TransactionListEnvelope,
)
def transactions(
    risk_level: str | None = None,
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    payment_method: str | None = None,
    bank: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    sort_by: str = "occurred_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> TransactionListEnvelope:
    data, pagination = list_transactions(
        db,
        merchant_id=current_user.merchant_id,
        page=page,
        page_size=page_size,
        risk_level=risk_level,
        status=status_filter,
        payment_method=payment_method,
        bank=bank,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return TransactionListEnvelope(
        data=data,
        pagination=pagination,
    )


@router.get(
    "/transactions/{transaction_id}",
    response_model=TransactionDetailEnvelope,
)
def transaction_detail(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> TransactionDetailEnvelope:
    data = get_transaction(
        db,
        merchant_id=current_user.merchant_id,
        transaction_id=transaction_id,
    )

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return TransactionDetailEnvelope(data=data)


@router.get(
    "/incidents",
    response_model=IncidentListEnvelope,
)
def incidents(
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    severity: str | None = None,
    incident_type: str | None = None,
    payment_method: str | None = None,
    bank: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> IncidentListEnvelope:
    data, pagination = list_incidents(
        db,
        merchant_id=current_user.merchant_id,
        page=page,
        page_size=page_size,
        status=status_filter,
        severity=severity,
        incident_type=incident_type,
        payment_method=payment_method,
        bank=bank,
        sort_order=sort_order,
    )

    return IncidentListEnvelope(
        data=data,
        pagination=pagination,
    )


@router.get(
    "/incidents/{incident_id}",
    response_model=IncidentDetailEnvelope,
)
def incident_detail(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> IncidentDetailEnvelope:
    data = get_incident(
        db,
        merchant_id=current_user.merchant_id,
        incident_id=incident_id,
    )

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return IncidentDetailEnvelope(data=data)


@router.get(
    "/incidents/{incident_id}/investigations",
    response_model=InvestigationListEnvelope,
)
def incident_investigations(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> InvestigationListEnvelope:
    # Tenant-scoped incident existence check.
    incident = get_incident(
        db,
        merchant_id=current_user.merchant_id,
        incident_id=incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return InvestigationListEnvelope(
        data=list_investigations(
            db,
            merchant_id=current_user.merchant_id,
            incident_id=incident_id,
        )
    )


@router.get(
    "/investigations/{investigation_id}",
    response_model=InvestigationDetailEnvelope,
)
def investigation_detail(
    investigation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> InvestigationDetailEnvelope:
    data = get_investigation(
        db,
        merchant_id=current_user.merchant_id,
        investigation_id=investigation_id,
    )

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found",
        )

    return InvestigationDetailEnvelope(
        data=data
    )


@router.get(
    "/incidents/{incident_id}/recommendations",
    response_model=RecommendationListEnvelope,
)
def incident_recommendations(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> RecommendationListEnvelope:
    incident = get_incident(
        db,
        merchant_id=current_user.merchant_id,
        incident_id=incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return RecommendationListEnvelope(
        data=list_recommendations(
            db,
            merchant_id=current_user.merchant_id,
            incident_id=incident_id,
        )
    )


@router.get(
    "/recommendations/{recommendation_id}",
    response_model=RecommendationDetailEnvelope,
)
def recommendation_detail(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> RecommendationDetailEnvelope:
    data = get_recommendation(
        db,
        merchant_id=current_user.merchant_id,
        recommendation_id=recommendation_id,
    )

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    return RecommendationDetailEnvelope(
        data=data
    )
