from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class SessionStartRequest(BaseModel):
    label: str = "untitled"
    device_id: str = "glove_right_01"
    notes: str = ""


class SessionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    label: str
    device_id: str = "glove_right_01"
    notes: str = ""
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    sample_count: int = 0
    samples: list[dict[str, Any]] = Field(default_factory=list)
