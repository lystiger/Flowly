from fastapi import APIRouter, HTTPException
from app.services.device_state import device_state_service
from app.models.device import DeviceStatus
from app.models.telemetry import TelemetryPacket

router = APIRouter(prefix="/api/device", tags=["device"])

@router.get("/status", response_model=DeviceStatus)
async def get_device_status(device_id: str = "glove_right_01"):
    status = device_state_service.get_status(device_id)
    if not status:
        # Return a default offline status instead of 404 for easier frontend handling
        return DeviceStatus(device_id=device_id, status="offline")
    return status

@router.get("/latest", response_model=TelemetryPacket)
async def get_latest_telemetry(device_id: str = "glove_right_01"):
    packet = device_state_service.latest_packets.get(device_id)
    if not packet:
        raise HTTPException(status_code=404, detail="No telemetry received yet")
    return packet
