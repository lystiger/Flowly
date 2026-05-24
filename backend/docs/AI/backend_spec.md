# Flowly Backend Specification

## Tech Stack
**Use:**
- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic
- `pyserial`
- `asyncio`
- WebSocket
- SQLite (for lightweight logging)
- SQLAlchemy (optional)
- `pytest` (for tests)

## Backend Goals

### Primary Goals
- Run a FastAPI server.
- Read sensor packets from the serial port.
- Support a mock data mode when hardware is unavailable.
- Parse incoming packets into structured models.
- Validate packet format.
- Maintain the latest device state.
- Broadcast live telemetry through WebSocket.
- Expose REST endpoints for the frontend.
- Save important logs and calibration profiles.
- Prepare a clean architecture for AI inference later.

### Initial Scope
For now, support one right-hand glove only.

**Device:**
- `device_id`: `glove_right_01`
- `hand`: right
- `flex_sensors`: 5
- `imu`: GY87
- `connection`: serial first, ESP-NOW later

**Flex sensors:**
- `thumb`
- `index`
- `middle`
- `ring`
- `pinky`

**IMU channels:**
- `accel_x`, `accel_y`, `accel_z`
- `gyro_x`, `gyro_y`, `gyro_z`
- `mag_x`, `mag_y`, `mag_z`
- `temperature`

## Expected Packet Format
Use JSON Lines from ESP32 or mock generator.

Each packet should be one JSON object per line:
```json
{
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
}
```

## Project Structure
Create this structure:
```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   ├── telemetry.py
│   │   ├── calibration.py
│   │   ├── device.py
│   │   └── logs.py
│   ├── api/
│   │   ├── routes_health.py
│   │   ├── routes_devices.py
│   │   ├── routes_calibration.py
│   │   ├── routes_logs.py
│   │   └── routes_sessions.py
│   ├── realtime/
│   │   ├── websocket_manager.py
│   │   └── broadcaster.py
│   ├── ingest/
│   │   ├── serial_reader.py
│   │   ├── mock_reader.py
│   │   ├── packet_parser.py
│   │   └── packet_validator.py
│   ├── services/
│   │   ├── device_state.py
│   │   ├── signal_filter.py
│   │   ├── calibration_service.py
│   │   ├── log_service.py
│   │   └── session_recorder.py
│   ├── ai/
│   │   ├── inference_service.py
│   │   └── feature_extractor.py
│   └── db/
│       ├── database.py
│       └── schema.py
├── tests/
│   ├── test_packet_parser.py
│   ├── test_signal_filter.py
│   ├── test_calibration.py
│   └── test_websocket.py
├── requirements.txt
├── .env.example
└── README.md
```

## Environment Variables
Create `.env.example`:
```ini
APP_NAME=GloveFlow Backend
APP_ENV=development
HOST=127.0.0.1
PORT=8000

DATA_MODE=mock
SERIAL_PORT=COM3
SERIAL_BAUDRATE=115200

WS_BROADCAST_HZ=30
MAX_ROLLING_WINDOW=300

DATABASE_URL=sqlite:///./gloveflow.db
```

`DATA_MODE` options:
- `mock`
- `serial`

## Core Services

### 1. Serial Reader
**Responsibilities:**
- Open serial port
- Read line-by-line JSON packets
- Reconnect if disconnected
- Handle invalid packets without crashing
- Push parsed packets into async queue

**Requirements:**
- Non-blocking or background task
- Graceful shutdown
- Reconnect loop
- Log connection state

### 2. Mock Reader
**Responsibilities:**
- Generate fake sensor packets
- Simulate flex sensor changes
- Simulate IMU movement
- Simulate packet loss and latency optionally
- Useful when ESP32 is not connected

**Update rate:**
- `50Hz` initial target

### 3. Packet Parser
**Responsibilities:**
- Convert raw JSON line to Pydantic model
- Reject malformed packets
- Check flex sensor length = 5
- Check ADC values are 0-4095
- Check sequence number
- Add server receive timestamp

### 4. Device State Service
**Maintain latest state:**
- `connection_status`
- `last_seen`
- `latest_packet`
- `packet_rate`
- `latency_ms`
- `dropped_packets`
- `total_received`
- `total_dropped`
- `battery`
- `rssi`

**Also detect:**
- stale device
- disconnected device
- sequence gap
- packet delay

### 5. Signal Filter Service
**Support:**
- raw signal
- moving average
- exponential smoothing
- deadzone
- spike rejection

**For each flex sensor, produce:**
- raw
- filtered
- normalized
- stability_score
- noise_level

**Initial filters:**
- `moving_average_window` = 5
- `ema_alpha` = 0.35
- `deadzone` = 3
- `spike_threshold` = 250

### 6. Calibration Service
**Responsibilities:**
- Store min/max values for each flex sensor
- Normalize raw ADC values to 0-1
- Save/load calibration profile
- Reset calibration
- Validate calibration quality

**Calibration model:**
```json
{
  "device_id": "glove_right_01",
  "hand": "right",
  "flex": {
    "thumb": { "min": 300, "max": 3100 },
    "index": { "min": 280, "max": 3200 },
    "middle": { "min": 290, "max": 3180 },
    "ring": { "min": 310, "max": 3050 },
    "pinky": { "min": 330, "max": 2900 }
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### 7. WebSocket Broadcaster
**Endpoint:** `/ws/live`

**Broadcast payload:**
```json
{
  "type": "telemetry",
  "device": {
    "id": "glove_right_01",
    "status": "online",
    "packet_rate": 50,
    "latency_ms": 12,
    "dropped_packets": 0
  },
  "flex": {
    "thumb": { "raw": 512, "filtered": 508, "normalized": 0.12, "stability": 0.94 },
    "index": { "raw": 610, "filtered": 604, "normalized": 0.18, "stability": 0.91 },
    "middle": { "raw": 580, "filtered": 575, "normalized": 0.16, "stability": 0.93 },
    "ring": { "raw": 430, "filtered": 428, "normalized": 0.08, "stability": 0.96 },
    "pinky": { "raw": 390, "filtered": 392, "normalized": 0.05, "stability": 0.95 }
  },
  "imu": {
    "accel": { "x": 0.12, "y": 0.98, "z": 0.05 },
    "gyro": { "x": 1.2, "y": 0.2, "z": -0.4 },
    "mag": { "x": 23.1, "y": -4.2, "z": 18.8 },
    "temp": 31.4
  },
  "timestamp": 1839203
}
```

## REST API Endpoints

### Health
`GET /health`

**Returns:**
```json
{
  "status": "ok",
  "app": "GloveFlow Backend",
  "mode": "mock"
}
```

### Device
`GET /api/device/status`  
Returns latest device state.

`GET /api/device/latest`  
Returns latest telemetry packet.

### Calibration
- `GET /api/calibration/profile`
- `POST /api/calibration/profile`
- `POST /api/calibration/reset`
- `POST /api/calibration/set-min/{sensor}`
- `POST /api/calibration/set-max/{sensor}`

**Sensors:** `thumb`, `index`, `middle`, `ring`, `pinky`

### Logs
- `GET /api/logs`
- `POST /api/logs/clear`

**Support query filters:** `level`, `source`, `limit`

### Sessions
- `POST /api/sessions/start`
- `POST /api/sessions/stop`
- `GET /api/sessions`
- `GET /api/sessions/{session_id}`

*Session recorder should save telemetry windows for replay/debugging.*

## WebSocket Events
**Frontend connects to:** `ws://localhost:8000/ws/live`

**Server sends:**
- `telemetry`
- `device_status`
- `log`
- `calibration_update`
- `error`

**Client can send:**
```json
{ "type": "ping" }
```

**Server replies:**
```json
{ "type": "pong" }
```

## Logging Requirements
**Log important events:**
- backend started
- websocket client connected
- websocket client disconnected
- serial connected
- serial disconnected
- invalid packet
- packet dropped
- calibration saved
- high jitter detected
- stale device warning

**Log model:**
```json
{
  "timestamp": "2026-01-01T00:00:00Z",
  "level": "INFO",
  "source": "serial_reader",
  "message": "Serial connected on COM3"
}
```

## Testing Requirements
**Write tests for:**
- **Parser:** valid packet, invalid JSON, missing fields, flex length not equal 5, ADC outside 0-4095
- **Calibration:** normalization works, min/max save correctly, reset works, invalid sensor rejected
- **Signal Filter:** moving average works, EMA works, spike rejection works, stability score returns 0-1
- **WebSocket:** client can connect, receives mock telemetry, ping/pong works

## Development Commands
**Install:**
```bash
python -m venv .venv
```
**Windows:**
```bash
.venv\Scripts\activate
```
**Linux/macOS/WSL:**
```bash
source .venv/bin/activate
```
**Install dependencies:**
```bash
pip install -r requirements.txt
```
**Run backend:**
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
**Run tests:**
```bash
pytest
```

## requirements.txt
**Use:**
- `fastapi`
- `uvicorn[standard]`
- `pydantic`
- `pydantic-settings`
- `python-dotenv`
- `pyserial`
- `sqlalchemy`
- `aiosqlite`
- `pytest`
- `pytest-asyncio`
- `httpx`

## Implementation Priority
1. **Phase 1 — Backend Skeleton:** FastAPI app, health route, config, mock reader, websocket endpoint
2. **Phase 2 — Telemetry Pipeline:** packet model, parser, mock packet generator, device state service, websocket broadcast loop
3. **Phase 3 — Calibration:** calibration model, normalization, profile save/load, calibration routes
4. **Phase 4 — Serial Input:** pyserial reader, reconnect handling, serial config, invalid packet protection
5. **Phase 5 — Logs and Sessions:** log service, session recorder, logs endpoint, session endpoint
6. **Phase 6 — AI Placeholder:** feature extractor, fake inference output, model-ready interface

## Important Design Rules
- Do not block the FastAPI event loop.
- Do not crash on malformed ESP32 packets.
- Backend must run without hardware using mock mode.
- WebSocket should always send structured JSON.
- Keep parsing, filtering, calibration, and broadcasting separate.
- Store only necessary logs first.
- Design for one glove now, but keep `device_id` for future multi-device support.
- Keep AI inference optional and isolated.
- Prioritize stability before advanced features.
- The backend must be easy to test.

## Final Goal
The backend should make this possible:
1. ESP32 data comes in
2. Backend validates and cleans it
3. Signal is filtered and calibrated
4. Frontend receives stable realtime telemetry
5. Engineer can debug connection, sensors, and data flow
6. System is ready for future AI gesture recognition

*Build the backend as a hardware observability bridge, not just a CRUD API.*
