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

For real glove testing, use serial mode:

```ini
DATA_MODE=serial
SERIAL_PORT=COM3
SERIAL_BAUDRATE=115200
```

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

## Arduino IDE Serial Setup

Arduino IDE is only needed to upload the glove sketch. During Flowly runtime, close Arduino Serial Monitor and Serial Plotter so the backend can open the serial port.

The sketch should print one complete JSON packet per line:

```cpp
Serial.println(jsonString);
```

The sketch baud rate must match `SERIAL_BAUDRATE`, normally `115200`.

### Windows

1. Install Arduino IDE and the ESP32 board package if needed.
2. Upload the glove sketch.
3. Close Serial Monitor and Serial Plotter.
4. Find the port in `Tools > Port` or Device Manager, for example `COM3`.
5. Set `.env`:

```ini
DATA_MODE=serial
SERIAL_PORT=COM3
SERIAL_BAUDRATE=115200
```

### Linux

1. Install Arduino IDE and the ESP32 board package if needed.
2. Add your user to the serial group, usually `dialout`, then log out and back in:

```bash
sudo usermod -aG dialout $USER
```

3. Upload the glove sketch.
4. Close Serial Monitor and Serial Plotter.
5. Find the port:

```bash
ls /dev/ttyUSB*
ls /dev/ttyACM*
```

6. Set `.env`:

```ini
DATA_MODE=serial
SERIAL_PORT=/dev/ttyUSB0
SERIAL_BAUDRATE=115200
```

If the backend logs that the port is busy or unavailable, close Arduino IDE serial tools and confirm the port name.

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
