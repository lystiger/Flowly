from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
async def get_health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "mode": settings.DATA_MODE
    }
