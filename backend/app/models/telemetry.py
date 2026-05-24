from pydantic import BaseModel, Field
from typing import List

class IMUAccel(BaseModel):
    x: float
    y: float
    z: float

class IMUGyro(BaseModel):
    x: float
    y: float
    z: float

class IMUMag(BaseModel):
    x: float
    y: float
    z: float

class IMUData(BaseModel):
    accel: IMUAccel
    gyro: IMUGyro
    mag: IMUMag
    temp: float

class TelemetryPacket(BaseModel):
    device_id: str
    seq: int
    timestamp_ms: int
    flex: List[int] = Field(..., min_length=5, max_length=5)
    imu: IMUData
    battery: int
    rssi: int
    source: str
