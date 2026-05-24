import json
import time
from typing import Optional
from app.models.telemetry import TelemetryPacket
from app.ingest.packet_validator import PacketValidator

class PacketParser:
    @staticmethod
    def parse(raw_data: str) -> Optional[TelemetryPacket]:
        """
        Parses a raw JSON string into a TelemetryPacket model.
        Returns None if parsing fails or validation fails.
        """
        try:
            data = json.loads(raw_data)
            packet = TelemetryPacket(**data)
            
            # Basic validation
            if not PacketValidator.is_valid(packet):
                return None
                
            packet.received_at = time.time()
            return packet
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            # In a real app, we might want to log this error
            return None
