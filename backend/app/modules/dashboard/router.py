from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.modules.auth.dependencies import (
    require_analyst_or_admin,
)
from app.modules.dashboard.schemas import (
    DashboardSummaryEnvelope,
    PaymentMethodEnvelope,
    RiskDistributionEnvelope,
)
from app.modules.dashboard.service import (
    get_dashboard_summary,
    get_payment_methods,
    get_risk_distribution,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardSummaryEnvelope,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> DashboardSummaryEnvelope:
    return DashboardSummaryEnvelope(
        data=get_dashboard_summary(
            db,
            merchant_id=current_user.merchant_id,
        )
    )


@router.get(
    "/risk-distribution",
    response_model=RiskDistributionEnvelope,
)
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> RiskDistributionEnvelope:
    return RiskDistributionEnvelope(
        data=get_risk_distribution(
            db,
            merchant_id=current_user.merchant_id,
        )
    )


@router.get(
    "/payment-methods",
    response_model=PaymentMethodEnvelope,
)
def payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_analyst_or_admin
    ),
) -> PaymentMethodEnvelope:
    return PaymentMethodEnvelope(
        data=get_payment_methods(
            db,
            merchant_id=current_user.merchant_id,
        )
    )
