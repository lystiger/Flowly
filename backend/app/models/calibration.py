from datetime import datetime, timezone
from typing import Dict, Literal

from pydantic import BaseModel, Field, field_validator

FLEX_SENSOR_NAMES = ("thumb", "index", "middle", "ring", "pinky")
SensorName = Literal["thumb", "index", "middle", "ring", "pinky"]


class FlexCalibrationRange(BaseModel):
    min: int = Field(0, ge=0, le=4095)
    max: int = Field(4095, ge=0, le=4095)

    @field_validator("max")
    @classmethod
    def max_can_equal_min_during_capture(cls, value: int) -> int:
        return value


class CalibrationProfile(BaseModel):
    device_id: str = "glove_right_01"
    hand: str = "right"
    flex: Dict[SensorName, FlexCalibrationRange] = Field(
        default_factory=lambda: {
            sensor: FlexCalibrationRange() for sensor in FLEX_SENSOR_NAMES
        }
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CalibrationQuality(BaseModel):
    valid: bool
    issues: list[str] = Field(default_factory=list)
