from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import routes_health
from app.realtime.websocket_manager import manager
from app.realtime.broadcaster import mock_reader
import asyncio

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_health.router)

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple ping/pong handle
            if "ping" in data:
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    # Start the mock reader loop in the background if in mock mode
    if settings.DATA_MODE == "mock":
        asyncio.create_task(mock_reader.start())

@app.on_event("shutdown")
async def shutdown_event():
    mock_reader.stop()
