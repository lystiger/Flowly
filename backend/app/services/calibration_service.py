from copy import deepcopy

from app.models.calibration import (
    FLEX_SENSOR_NAMES,
    CalibrationProfile,
    CalibrationQuality,
    SensorName,
)


class CalibrationService:
    def __init__(self) -> None:
        self._profile = CalibrationProfile()

    def get_profile(self) -> CalibrationProfile:
        return deepcopy(self._profile)

    def save_profile(self, profile: CalibrationProfile) -> CalibrationProfile:
        self._profile = profile
        return self.get_profile()

    def reset(self) -> CalibrationProfile:
        self._profile = CalibrationProfile()
        return self.get_profile()

    def set_min(self, sensor: SensorName, value: int) -> CalibrationProfile:
        self._validate_adc(value)
        self._profile.flex[sensor].min = value
        return self.get_profile()

    def set_max(self, sensor: SensorName, value: int) -> CalibrationProfile:
        self._validate_adc(value)
        self._profile.flex[sensor].max = value
        return self.get_profile()

    def normalize(self, sensor: SensorName, raw: int) -> float:
        if sensor not in FLEX_SENSOR_NAMES:
            raise ValueError(f"Unknown flex sensor: {sensor}")
        bounds = self._profile.flex[sensor]
        span = bounds.max - bounds.min
        if span <= 0:
            return 0.0
        return max(0.0, min(1.0, (raw - bounds.min) / span))

    def quality(self) -> CalibrationQuality:
        issues = []
        for sensor, bounds in self._profile.flex.items():
            if bounds.max <= bounds.min:
                issues.append(f"{sensor} max must be greater than min")
            elif bounds.max - bounds.min < 50:
                issues.append(f"{sensor} calibration range is too narrow")
        return CalibrationQuality(valid=not issues, issues=issues)

    @staticmethod
    def _validate_adc(value: int) -> None:
        if not 0 <= value <= 4095:
            raise ValueError("ADC value must be between 0 and 4095")


calibration_service = CalibrationService()
