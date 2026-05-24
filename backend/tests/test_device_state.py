import pytest
import time
from app.services.device_state import DeviceStateService
from app.models.telemetry import TelemetryPacket, IMUData, IMUAccel, IMUGyro, IMUMag

@pytest.fixture
def service():
    return DeviceStateService()

def create_packet(seq, device_id="glove_right_01", timestamp_ms=None):
    if timestamp_ms is None:
        timestamp_ms = int(time.time() * 1000)
    return TelemetryPacket(
        device_id=device_id,
        seq=seq,
        timestamp_ms=timestamp_ms,
        flex=[500, 500, 500, 500, 500],
        imu=IMUData(
            accel=IMUAccel(x=0, y=0, z=1),
            gyro=IMUGyro(x=0, y=0, z=0),
            mag=IMUMag(x=10, y=10, z=10),
            temp=30.0
        ),
        battery=90,
        rssi=-50,
        source="mock",
        received_at=time.time()
    )

def test_device_state_initialization(service):
    status = service.get_status("non_existent")
    assert status is None

def test_device_state_update(service):
    packet = create_packet(seq=1)
    service.update(packet)
    
    status = service.get_status("glove_right_01")
    assert status is not None
    assert status.device_id == "glove_right_01"
    assert status.last_seq == 1
    assert status.total_received == 1
    assert status.status == "online"

def test_dropped_packets_detection(service):
    service.update(create_packet(seq=1))
    service.update(create_packet(seq=5)) # gap of 3 packets (2, 3, 4)
    
    status = service.get_status("glove_right_01")
    assert status.dropped_packets == 3
    assert status.total_dropped == 3

def test_staleness_detection(service):
    packet = create_packet(seq=1)
    # Mock received_at to be in the past
    packet.received_at = time.time() - 2.0
    service.update(packet)
    
    status = service.get_status("glove_right_01")
    assert status.status == "stale"
    
    packet.received_at = time.time() - 6.0
    service.update(packet)
    status = service.get_status("glove_right_01")
    assert status.status == "offline"

def test_packet_rate_calculation(service):
    # This test is a bit tricky because of the 1s window
    # We'll just check if it's updated
    service.update(create_packet(seq=1))
    time.sleep(1.1)
    service.update(create_packet(seq=2))
    service.update(create_packet(seq=3))
    
    status = service.get_status("glove_right_01")
    # packet_rate should be updated after the second update because elapsed > 1s
    assert status.packet_rate > 0
