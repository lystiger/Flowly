import json
from app.realtime.websocket_manager import manager
from app.ingest.mock_reader import MockReader
from app.ingest.packet_parser import PacketParser
from app.services.device_state import device_state_service

mock_reader = MockReader(hz=50)

async def handle_packet(raw_json: str):
    # Use PacketParser to parse and validate
    packet = PacketParser.parse(raw_json)
    if not packet:
        # Malformed or invalid packet ignored
        return
    
    # Update device state
    device_state_service.update(packet)
    status = device_state_service.get_status(packet.device_id)
    
    # Broadcast the validated packet as dict to WS clients
    payload = {
        "type": "telemetry",
        "device": {
            "id": status.device_id,
            "status": status.status,
            "packet_rate": round(status.packet_rate, 1),
            "latency_ms": round(status.latency_ms, 1),
            "dropped_packets": status.dropped_packets
        },
        "flex": {
            "thumb": {"raw": packet.flex[0], "filtered": packet.flex[0], "normalized": 0.0, "stability": 0.0},
            "index": {"raw": packet.flex[1], "filtered": packet.flex[1], "normalized": 0.0, "stability": 0.0},
            "middle": {"raw": packet.flex[2], "filtered": packet.flex[2], "normalized": 0.0, "stability": 0.0},
            "ring": {"raw": packet.flex[3], "filtered": packet.flex[3], "normalized": 0.0, "stability": 0.0},
            "pinky": {"raw": packet.flex[4], "filtered": packet.flex[4], "normalized": 0.0, "stability": 0.0}
        },
        "imu": packet.imu.dict(),
        "timestamp": packet.timestamp_ms
    }
    await manager.broadcast(payload)

# Subscribe the broadcaster to the mock reader
mock_reader.on_packet(handle_packet)
