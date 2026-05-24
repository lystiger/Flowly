from collections import deque
from statistics import mean

from app.models.calibration import FLEX_SENSOR_NAMES, SensorName
from app.services.calibration_service import calibration_service


class SignalFilterService:
    def __init__(
        self,
        moving_average_window: int = 5,
        ema_alpha: float = 0.35,
        deadzone: int = 3,
        spike_threshold: int = 250,
    ) -> None:
        self.moving_average_window = moving_average_window
        self.ema_alpha = ema_alpha
        self.deadzone = deadzone
        self.spike_threshold = spike_threshold
        self._windows = {
            sensor: deque(maxlen=moving_average_window) for sensor in FLEX_SENSOR_NAMES
        }
        self._ema: dict[str, float] = {}
        self._last_raw: dict[str, int] = {}
        self._last_filtered: dict[str, float] = {}

    def reset(self) -> None:
        for window in self._windows.values():
            window.clear()
        self._ema.clear()
        self._last_raw.clear()
        self._last_filtered.clear()

    def process(self, sensor: SensorName, raw: int) -> dict:
        if sensor not in FLEX_SENSOR_NAMES:
            raise ValueError(f"Unknown flex sensor: {sensor}")

        previous_raw = self._last_raw.get(sensor)
        accepted_raw = raw
        if previous_raw is not None and abs(raw - previous_raw) > self.spike_threshold:
            accepted_raw = previous_raw

        window = self._windows[sensor]
        window.append(accepted_raw)
        moving_average = mean(window)

        previous_ema = self._ema.get(sensor, moving_average)
        ema = (self.ema_alpha * moving_average) + ((1 - self.ema_alpha) * previous_ema)

        previous_filtered = self._last_filtered.get(sensor)
        filtered = ema
        if previous_filtered is not None and abs(ema - previous_filtered) < self.deadzone:
            filtered = previous_filtered

        self._last_raw[sensor] = accepted_raw
        self._ema[sensor] = ema
        self._last_filtered[sensor] = filtered

        noise_level = max(window) - min(window) if len(window) > 1 else 0
        stability = max(0.0, min(1.0, 1.0 - (noise_level / max(self.spike_threshold, 1))))

        return {
            "raw": raw,
            "filtered": round(filtered, 2),
            "normalized": round(calibration_service.normalize(sensor, int(filtered)), 4),
            "stability": round(stability, 4),
            "stability_score": round(stability, 4),
            "noise_level": noise_level,
        }

    def process_flex(self, values: list[int]) -> dict:
        return {
            sensor: self.process(sensor, values[index])
            for index, sensor in enumerate(FLEX_SENSOR_NAMES)
        }


signal_filter_service = SignalFilterService()
