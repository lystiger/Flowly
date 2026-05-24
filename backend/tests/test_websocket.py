from fastapi.testclient import TestClient

from app.main import app


def test_websocket_ping_pong():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/live") as websocket:
            first = websocket.receive_json()
            assert first["type"] in {"device_status", "telemetry"}

            websocket.send_json({"type": "ping"})
            response = websocket.receive_json()

            assert response == {"type": "pong"}


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
