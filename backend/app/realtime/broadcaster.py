import json
from app.realtime.websocket_manager import manager
from app.ingest.mock_reader import MockReader
from app.models.telemetry import TelemetryPacket
from pydantic import ValidationError

mock_reader = MockReader(hz=50)

async def handle_packet(raw_json: str):
    try:
        data = json.loads(raw_json)
        # Parse and validate with Pydantic
        packet = TelemetryPacket(**data)
        
        # Broadcast the validated packet as dict to WS clients
        payload = {
            "type": "telemetry",
            "device": {
                "id": packet.device_id,
                "status": "online",
                "packet_rate": 50, # Mocked for now
                "latency_ms": 10,
                "dropped_packets": 0
            },
            "flex": {
                "thumb": {"raw": packet.flex[0], "filtered": packet.flex[0], "normalized": 0.5, "stability": 0.9},
                "index": {"raw": packet.flex[1], "filtered": packet.flex[1], "normalized": 0.5, "stability": 0.9},
                "middle": {"raw": packet.flex[2], "filtered": packet.flex[2], "normalized": 0.5, "stability": 0.9},
                "ring": {"raw": packet.flex[3], "filtered": packet.flex[3], "normalized": 0.5, "stability": 0.9},
                "pinky": {"raw": packet.flex[4], "filtered": packet.flex[4], "normalized": 0.5, "stability": 0.9}
            },
            "imu": packet.imu.dict(),
            "timestamp": packet.timestamp_ms
        }
        await manager.broadcast(payload)
    except ValidationError as e:
        print(f"Packet validation error: {e}")
    except json.JSONDecodeError:
        print("Invalid JSON received")

# Subscribe the broadcaster to the mock reader
mock_reader.on_packet(handle_packet)
