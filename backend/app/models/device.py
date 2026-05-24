from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceStatus(BaseModel):
    device_id: str
    status: str = "offline"  # online, offline, stale
    last_seen: Optional[datetime] = None
    packet_rate: float = 0.0
    latency_ms: float = 0.0
    dropped_packets: int = 0
    total_received: int = 0
    total_dropped: int = 0
    battery: int = 0
    rssi: int = 0
    last_seq: int = -1
