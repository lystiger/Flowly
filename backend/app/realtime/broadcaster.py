from app.ingest.mock_reader import MockReader
from app.ingest.packet_parser import PacketParser
from app.realtime.websocket_manager import manager
from app.services.device_state import device_state_service
from app.services.log_service import log_service
from app.services.session_recorder import session_recorder
from app.services.signal_filter import signal_filter_service

mock_reader = MockReader(hz=50)


async def handle_packet(raw_json: str):
    packet = PacketParser.parse(raw_json)
    if not packet:
        log_service.add("WARNING", "packet_parser", "Dropped malformed telemetry packet")
        return

    device_state_service.update(packet)
    status = device_state_service.get_status(packet.device_id)
    filtered_flex = signal_filter_service.process_flex(packet.flex)

    imu_flat = {
        "accelX": packet.imu.accel.x,
        "accelY": packet.imu.accel.y,
        "accelZ": packet.imu.accel.z,
        "gyroX": packet.imu.gyro.x,
        "gyroY": packet.imu.gyro.y,
        "gyroZ": packet.imu.gyro.z,
        "pitch": 0.0,
        "roll": 0.0,
        "yaw": 0.0,
    }
    flex_flat = {
        "thumb": packet.flex[0],
        "index": packet.flex[1],
        "middle": packet.flex[2],
        "ring": packet.flex[3],
        "pinky": packet.flex[4],
    }

    payload = {
        "type": "telemetry",
        "sequenceId": packet.seq,
        "timestamp": packet.timestamp_ms,
        "device": {
            "id": status.device_id,
            "status": status.status,
            "packet_rate": round(status.packet_rate, 1),
            "latency_ms": round(status.latency_ms, 1),
            "dropped_packets": status.dropped_packets,
        },
        "flex": flex_flat,
        "imu": imu_flat,
        "backend": {
            "seq": packet.seq,
            "timestamp_ms": packet.timestamp_ms,
            "flex": filtered_flex,
            "imu": packet.imu.model_dump(),
            "battery": packet.battery,
            "rssi": packet.rssi,
            "source": packet.source,
            "received_at": packet.received_at,
        },
        "compat": {
            "sequenceId": packet.seq,
            "timestamp": packet.timestamp_ms,
            "flex": flex_flat,
            "imu": imu_flat,
        },
    }
    session_recorder.record(packet.device_id, payload)
    await manager.broadcast(payload)


def build_device_status_payload(device_id: str = "glove_right_01") -> dict:
    status = device_state_service.get_status(device_id)
    if not status:
        return {
            "type": "device_status",
            "device": {"id": device_id, "status": "offline"},
        }
    return {
        "type": "device_status",
        "device": {
            "id": status.device_id,
            "status": status.status,
            "packet_rate": round(status.packet_rate, 1),
            "latency_ms": round(status.latency_ms, 1),
            "dropped_packets": status.dropped_packets,
            "total_received": status.total_received,
            "total_dropped": status.total_dropped,
            "battery": status.battery,
            "rssi": status.rssi,
        },
    }


mock_reader.on_packet(handle_packet)
