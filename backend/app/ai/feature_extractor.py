from collections import deque
from statistics import mean, pstdev
from typing import Any


class FeatureExtractor:
    def __init__(self, window_size: int = 25) -> None:
        self.window: deque[dict[str, Any]] = deque(maxlen=window_size)

    def add_sample(self, sample: dict[str, Any]) -> None:
        self.window.append(sample)

    def extract(self) -> dict[str, float]:
        if not self.window:
            return {}
        features: dict[str, float] = {}
        for sensor in ("thumb", "index", "middle", "ring", "pinky"):
            values = [sample["flex"][sensor] for sample in self.window if "flex" in sample]
            if values:
                features[f"{sensor}_mean"] = mean(values)
                features[f"{sensor}_std"] = pstdev(values) if len(values) > 1 else 0.0
                features[f"{sensor}_min"] = min(values)
                features[f"{sensor}_max"] = max(values)
        return features
