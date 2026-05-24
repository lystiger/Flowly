from datetime import datetime, timezone

from app.models.session import SessionRecord, SessionStartRequest


class SessionRecorder:
    def __init__(self) -> None:
        self._sessions: dict[str, SessionRecord] = {}
        self._active_id: str | None = None

    def start(self, request: SessionStartRequest) -> SessionRecord:
        session = SessionRecord(
            label=request.label,
            device_id=request.device_id,
            notes=request.notes,
        )
        self._sessions[session.id] = session
        self._active_id = session.id
        return session

    def stop(self) -> SessionRecord | None:
        if not self._active_id:
            return None
        session = self._sessions[self._active_id]
        session.end_time = datetime.now(timezone.utc)
        self._active_id = None
        return session

    def record(self, device_id: str, sample: dict) -> None:
        if not self._active_id:
            return
        session = self._sessions[self._active_id]
        if session.device_id != device_id:
            return
        session.samples.append(sample)
        session.sample_count += 1

    def list(self) -> list[SessionRecord]:
        return list(self._sessions.values())

    def get(self, session_id: str) -> SessionRecord | None:
        return self._sessions.get(session_id)


session_recorder = SessionRecorder()
