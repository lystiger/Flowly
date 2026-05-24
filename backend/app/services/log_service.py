from app.models.logs import LogLevel, SystemLog


class LogService:
    def __init__(self, max_entries: int = 1000) -> None:
        self.max_entries = max_entries
        self._logs: list[SystemLog] = []

    def add(self, level: LogLevel, source: str, message: str) -> SystemLog:
        entry = SystemLog(level=level, source=source, message=message)
        self._logs.append(entry)
        if len(self._logs) > self.max_entries:
            self._logs = self._logs[-self.max_entries :]
        return entry

    def list(
        self,
        level: LogLevel | None = None,
        source: str | None = None,
        limit: int = 100,
    ) -> list[SystemLog]:
        entries = self._logs
        if level:
            entries = [entry for entry in entries if entry.level == level]
        if source:
            entries = [entry for entry in entries if entry.source == source]
        return entries[-limit:]

    def clear(self) -> dict:
        count = len(self._logs)
        self._logs.clear()
        return {"cleared": count}


log_service = LogService()
