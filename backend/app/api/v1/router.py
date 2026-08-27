from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.modules.auth.router import router as auth_router
from app.modules.recommendations.router import router as recommendations_router
from app.modules.transactions.router import router as transactions_router
from app.modules.copilot.router import router as copilot_router

api_router = APIRouter()

api_router.include_router(
    health_router,
    tags=["Health"],
)

api_router.include_router(auth_router)
api_router.include_router(recommendations_router)
api_router.include_router(transactions_router)

api_router.include_router(copilot_router)
