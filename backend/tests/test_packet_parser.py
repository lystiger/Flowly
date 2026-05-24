import pytest
import json
from app.ingest.packet_parser import PacketParser
from app.models.telemetry import TelemetryPacket

def test_parse_valid_packet():
    raw_data = json.dumps({
        "device_id": "glove_right_01",
        "seq": 1024,
        "timestamp_ms": 1839203,
        "flex": [512, 610, 580, 430, 390],
        "imu": {
            "accel": { "x": 0.12, "y": 0.98, "z": 0.05 },
            "gyro": { "x": 1.2, "y": 0.2, "z": -0.4 },
            "mag": { "x": 23.1, "y": -4.2, "z": 18.8 },
            "temp": 31.4
        },
        "battery": 87,
        "rssi": -48,
        "source": "serial"
    })
    packet = PacketParser.parse(raw_data)
    assert packet is not None
    assert isinstance(packet, TelemetryPacket)
    assert packet.device_id == "glove_right_01"
    assert packet.received_at is not None

def test_parse_invalid_json():
    raw_data = "invalid json"
    packet = PacketParser.parse(raw_data)
    assert packet is None

def test_parse_missing_fields():
    raw_data = json.dumps({
        "device_id": "glove_right_01",
        "seq": 1024
        # missing flex, imu, etc.
    })
    packet = PacketParser.parse(raw_data)
    assert packet is None

def test_parse_invalid_flex_length():
    raw_data = json.dumps({
        "device_id": "glove_right_01",
        "seq": 1024,
        "timestamp_ms": 1839203,
        "flex": [512, 610, 580, 430], # only 4
        "imu": {
            "accel": { "x": 0.12, "y": 0.98, "z": 0.05 },
            "gyro": { "x": 1.2, "y": 0.2, "z": -0.4 },
            "mag": { "x": 23.1, "y": -4.2, "z": 18.8 },
            "temp": 31.4
        },
        "battery": 87,
        "rssi": -48,
        "source": "serial"
    })
    packet = PacketParser.parse(raw_data)
    assert packet is None

def test_parse_adc_out_of_range():
    raw_data = json.dumps({
        "device_id": "glove_right_01",
        "seq": 1024,
        "timestamp_ms": 1839203,
        "flex": [5000, 610, 580, 430, 390], # 5000 > 4095
        "imu": {
            "accel": { "x": 0.12, "y": 0.98, "z": 0.05 },
            "gyro": { "x": 1.2, "y": 0.2, "z": -0.4 },
            "mag": { "x": 23.1, "y": -4.2, "z": 18.8 },
            "temp": 31.4
        },
        "battery": 87,
        "rssi": -48,
        "source": "serial"
    })
    packet = PacketParser.parse(raw_data)
    assert packet is None
