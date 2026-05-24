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
        self.clock_offsets: Dict[str, float] = {}
        self.latency_buffer: Dict[str, list[float]] = {}

    def update(self, packet: TelemetryPacket):
        device_id = packet.device_id
        now = time.time()
        now_ms = now * 1000
        
        self.latest_packets[device_id] = packet
        
        if device_id not in self.states:
            self.states[device_id] = DeviceStatus(device_id=device_id)
            self.window_start_time[device_id] = now
            self.packet_counts[device_id] = 0
            self.latency_buffer[device_id] = []
            # Initialize clock offset: assume the first packet has 0 network latency
            self.clock_offsets[device_id] = now_ms - packet.timestamp_ms

        state = self.states[device_id]
        
        # Calculate dropped packets from sequence gap
        if state.last_seq != -1:
            if packet.seq > state.last_seq:
                gap = packet.seq - state.last_seq - 1
                if gap > 0:
                    state.dropped_packets += gap
                    state.total_dropped += gap
            elif packet.seq < state.last_seq:
                # Sequence reset likely means a device reboot or wrap-around
                # Clear clock offset and buffer to avoid latency spikes during recovery
                self.clock_offsets[device_id] = now_ms - packet.timestamp_ms
                self.latency_buffer[device_id] = []
        
        state.last_seq = packet.seq
        state.last_seen = datetime.fromtimestamp(packet.received_at or now, tz=timezone.utc)
        state.total_received += 1
        state.battery = packet.battery
        state.rssi = packet.rssi
        state.status = "online"
        
        # Latency calculation:
        # 1. Calculate raw latency based on initial offset
        # 2. Update offset if we see a "faster" packet (handles clock drift)
        current_offset = now_ms - packet.timestamp_ms
        if current_offset < self.clock_offsets[device_id]:
            self.clock_offsets[device_id] = current_offset
            
        raw_latency = current_offset - self.clock_offsets[device_id]
        
        # Smoothing latency with a small moving average
        self.latency_buffer[device_id].append(raw_latency)
        if len(self.latency_buffer[device_id]) > 10:
            self.latency_buffer[device_id].pop(0)
        
        state.latency_ms = sum(self.latency_buffer[device_id]) / len(self.latency_buffer[device_id])
        
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
