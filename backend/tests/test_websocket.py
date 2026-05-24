from fastapi.testclient import TestClient

from app.main import app


def test_websocket_ping_pong():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/live") as websocket:
            # Drain initial status or any early telemetry
            first = websocket.receive_json()
            assert first["type"] in {"device_status", "telemetry"}

            websocket.send_json({"type": "ping"})
            
            # Since mock reader is running at 50Hz, we might get telemetry 
            # before the pong. Wait for pong specifically.
            for _ in range(100):
                response = websocket.receive_json()
                if response["type"] == "pong":
                    return
            
            raise AssertionError("Did not receive pong response")


def test_websocket_receives_mock_telemetry_shape():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/live") as websocket:
            for _ in range(10):
                message = websocket.receive_json()
                if message["type"] != "telemetry":
                    continue

                assert "sequenceId" in message
                assert "timestamp" in message
                assert set(message["flex"]) == {"thumb", "index", "middle", "ring", "pinky"}
                assert {
                    "accelX",
                    "accelY",
                    "accelZ",
                    "gyroX",
                    "gyroY",
                    "gyroZ",
                    "pitch",
                    "roll",
                    "yaw",
                }.issubset(message["imu"])
                return

            raise AssertionError("No telemetry message received")
