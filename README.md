# Flowly

Flowly is a glove telemetry dashboard for monitoring flex sensors, IMU movement, pipeline health, calibration state, and labeled gesture recording. The frontend currently runs with mock sensor data so the team can validate workflows before backend and hardware integration.

## Frontend Pages

### Live Monitor

Use this page to inspect the current sensor stream, packet stats, flex sensor charts, IMU orientation, and raw packet output.

![Live Monitor](docs/images/live-monitor.png)

### Calibration

Use this page to capture open-hand and closed-hand reference values, preview normalized flex values, and save reusable calibration profiles.

![Calibration](docs/images/calibration.png)

### Flow Health

Use this page to debug the data pipeline. It tracks WebSocket latency, packet throughput, dropped packets, parser errors, jitter, and recent pipeline events.

![Flow Health](docs/images/flow-health.png)

### Session Recorder

Use this page to record labeled gesture sessions and export datasets as CSV or JSON for later backend and ML work.

![Session Recorder](docs/images/session-recorder.png)

### Instructions

Use this page as the in-app guide for new team members. It explains the recommended workflow before backend integration.

![Instructions](docs/images/instructions.png)

## How To Run

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

For a production build:

```bash
cd frontend
npm run build
```

## Arduino IDE Hardware Setup

Flowly does not need special Arduino IDE integration. The Arduino IDE is used to upload the glove firmware; after upload, the backend owns the serial port.

The glove sketch must send one complete JSON object per line:

```cpp
Serial.println(jsonString);
```

The backend expects the baud rate to match:

```ini
DATA_MODE=serial
SERIAL_BAUDRATE=115200
```

### Windows

1. Install Arduino IDE.
2. Install the ESP32 board package in Arduino IDE if the glove uses ESP32.
3. Upload the glove sketch.
4. Close Arduino Serial Monitor and Serial Plotter.
5. Find the board port in `Tools > Port` or Windows Device Manager, for example `COM3`.
6. Set backend `.env`:

```ini
DATA_MODE=serial
SERIAL_PORT=COM3
SERIAL_BAUDRATE=115200
```

### Linux

1. Install Arduino IDE.
2. Install the ESP32 board package in Arduino IDE if the glove uses ESP32.
3. Add your user to the serial group, usually `dialout`, then log out and back in:

```bash
sudo usermod -aG dialout $USER
```

4. Upload the glove sketch.
5. Close Arduino Serial Monitor and Serial Plotter.
6. Find the board port:

```bash
ls /dev/ttyUSB*
ls /dev/ttyACM*
```

7. Set backend `.env`:

```ini
DATA_MODE=serial
SERIAL_PORT=/dev/ttyUSB0
SERIAL_BAUDRATE=115200
```

Important: only one program can usually read the serial port at a time. If Arduino Serial Monitor is open, the backend may fail to connect.

## Team Workflow

1. Open **Live Monitor** and confirm the app is receiving mock or real packets.
2. Open **Calibration** and capture open and closed hand poses before recording training data.
3. Open **Flow Health** if sensor values look wrong or the stream becomes unstable.
4. Open **Session Recorder**, choose a gesture label, record a clean sample, then export CSV or JSON.
5. Open **Instructions** when onboarding another member or checking the agreed frontend workflow.

## Recording Rules

- Use lowercase snake_case gesture labels, for example `thank_you`.
- Record short, clean sessions instead of one long mixed session.
- Use the same calibration profile for one shared dataset batch.
- Export sessions before clearing the recorder table.
- Check Flow Health before reporting backend or hardware stream issues.

## Current Status

- Frontend shell, navigation, and pages are wired.
- Mock telemetry is available for frontend testing.
- Session recording exports CSV and JSON from browser memory.
- Backend integration is the next build stage.
