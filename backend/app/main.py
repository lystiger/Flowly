import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    routes_calibration,
    routes_devices,
    routes_health,
    routes_logs,
    routes_sessions,
)
from app.config import settings
from app.ingest.serial_reader import SerialReader
from app.realtime.broadcaster import build_device_status_payload, handle_packet, mock_reader
from app.realtime.websocket_manager import manager
from app.services.device_state import device_state_service
from app.services.log_service import log_service

serial_reader = SerialReader(settings.SERIAL_PORT, settings.SERIAL_BAUDRATE)
serial_reader.on_packet(handle_packet)
reader_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global reader_task
    log_service.add("INFO", "main", f"Backend started in {settings.DATA_MODE} mode")
    if settings.DATA_MODE == "mock":
        reader_task = asyncio.create_task(mock_reader.start())
    elif settings.DATA_MODE == "serial":
        reader_task = asyncio.create_task(serial_reader.start())
    try:
        yield
    finally:
        mock_reader.stop()
        serial_reader.stop()
        if reader_task:
            reader_task.cancel()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_health.router)
app.include_router(routes_devices.router)
app.include_router(routes_calibration.router)
app.include_router(routes_logs.router)
app.include_router(routes_sessions.router)


@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Administrative stream: send initial status
    await websocket.send_json(build_device_status_payload("glove_right_01"))
    try:
        while True:
            data = await websocket.receive_text()
            if "ping" in data:
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.websocket("/ws/sensor")
async def websocket_sensor_endpoint(websocket: WebSocket):
    """
    Strict telemetry stream for frontend compatibility.
    Does not send status messages that could break the parser.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if "ping" in data:
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
