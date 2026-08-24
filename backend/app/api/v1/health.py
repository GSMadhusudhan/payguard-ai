from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "service": "PayGuard AI",
            "version": "1.0.0",
        },
    }
