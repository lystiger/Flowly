from fastapi import APIRouter, Query

from app.models.logs import LogLevel, SystemLog
from app.services.log_service import log_service

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("", response_model=list[SystemLog])
async def get_logs(
    level: LogLevel | None = None,
    source: str | None = None,
    limit: int = Query(100, ge=1, le=1000),
):
    return log_service.list(level=level, source=source, limit=limit)


@router.post("/clear")
async def clear_logs():
    return log_service.clear()
