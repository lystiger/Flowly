from fastapi import APIRouter, HTTPException

from app.models.session import SessionRecord, SessionStartRequest
from app.services.session_recorder import session_recorder

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/start", response_model=SessionRecord)
async def start_session(request: SessionStartRequest):
    return session_recorder.start(request)


@router.post("/stop", response_model=SessionRecord)
async def stop_session():
    session = session_recorder.stop()
    if not session:
        raise HTTPException(status_code=404, detail="No active session")
    return session


@router.get("", response_model=list[SessionRecord])
async def list_sessions():
    return session_recorder.list()


@router.get("/{session_id}", response_model=SessionRecord)
async def get_session(session_id: str):
    session = session_recorder.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
