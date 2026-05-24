import time
from datetime import datetime, timezone
from typing import Dict, Optional
from app.models.telemetry import TelemetryPacket
from app.models.device import DeviceStatus

class DeviceStateService:
    def __init__(self):
        self.states: Dict[str, DeviceStatus] = {}
        self.packet_counts: Dict[str, int] = {}
        self.window_start_time: Dict[str, float] = {}
        self.latest_packets: Dict[str, TelemetryPacket] = {}

    def update(self, packet: TelemetryPacket):
        device_id = packet.device_id
        now = time.time()
        
        self.latest_packets[device_id] = packet
        
        if device_id not in self.states:
            self.states[device_id] = DeviceStatus(device_id=device_id)
            self.window_start_time[device_id] = now
            self.packet_counts[device_id] = 0

        state = self.states[device_id]
        
        # Calculate dropped packets from sequence gap
        if state.last_seq != -1:
            # Handle sequence wrap around if necessary (e.g. 16-bit or 32-bit)
            # For now assume simple incrementing
            if packet.seq > state.last_seq:
                gap = packet.seq - state.last_seq - 1
                if gap > 0:
                    state.dropped_packets += gap
                    state.total_dropped += gap
            elif packet.seq < state.last_seq:
                # Sequence reset or wrap around
                pass
        
        state.last_seq = packet.seq
        state.last_seen = datetime.fromtimestamp(packet.received_at or now, tz=timezone.utc)
        state.total_received += 1
        state.battery = packet.battery
        state.rssi = packet.rssi
        state.status = "online"
        
        # Simple latency estimate (offset might be large if clocks are not synced)
        state.latency_ms = (now * 1000) - packet.timestamp_ms
        
        # Update packet rate windowed
        self.packet_counts[device_id] += 1
        elapsed = now - self.window_start_time[device_id]
        if elapsed >= 1.0:
            state.packet_rate = self.packet_counts[device_id] / elapsed
            self.packet_counts[device_id] = 0
            self.window_start_time[device_id] = now

    def get_status(self, device_id: str) -> Optional[DeviceStatus]:
        state = self.states.get(device_id)
        if not state:
            return None
        
        # Check for staleness/offline
        if state.last_seen:
            elapsed = (datetime.now(timezone.utc) - state.last_seen).total_seconds()
            if elapsed > 5.0:
                state.status = "offline"
            elif elapsed > 1.0:
                state.status = "stale"
        
        return state

# Global singleton for the service
device_state_service = DeviceStateService()
