# Flowly Backend

FastAPI backend for Flowly glove telemetry. It runs without hardware in mock mode, validates incoming JSON-line packets, maintains device state, broadcasts live WebSocket telemetry, and exposes calibration, logs, and session APIs.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` if you want to override defaults. `DATA_MODE=mock` runs without a serial device.

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

ASGI entrypoint:

```text
app.main:app
```

## Test

```bash
pytest
```

## Main Endpoints

- `GET /health`
- `GET /api/device/status`
- `GET /api/device/latest`
- `GET /api/calibration/profile`
- `POST /api/calibration/profile`
- `POST /api/calibration/reset`
- `POST /api/calibration/set-min/{sensor}?value=300`
- `POST /api/calibration/set-max/{sensor}?value=3100`
- `GET /api/calibration/quality`
- `GET /api/logs`
- `POST /api/logs/clear`
- `POST /api/sessions/start`
- `POST /api/sessions/stop`
- `GET /api/sessions`
- `GET /api/sessions/{session_id}`
- `WS /ws/live`

## WebSocket Shape

`/ws/live` sends structured telemetry with frontend-compatible fields:

```json
{
  "type": "telemetry",
  "sequenceId": 1,
  "timestamp": 1710000000000,
  "flex": {
    "thumb": 512,
    "index": 610,
    "middle": 580,
    "ring": 430,
    "pinky": 390
  },
  "imu": {
    "accelX": 0.12,
    "accelY": 0.98,
    "accelZ": 0.05,
    "gyroX": 1.2,
    "gyroY": 0.2,
    "gyroZ": -0.4,
    "pitch": 0.0,
    "roll": 0.0,
    "yaw": 0.0
  }
}
```

It also includes `device`, `backend`, and `compat` fields for richer backend diagnostics and frontend migration.
