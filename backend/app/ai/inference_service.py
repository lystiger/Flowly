from app.ai.feature_extractor import FeatureExtractor


class InferenceService:
    def __init__(self) -> None:
        self.feature_extractor = FeatureExtractor()

    def predict(self, sample: dict) -> dict:
        self.feature_extractor.add_sample(sample)
        return {
            "gesture": "no_gesture",
            "confidence": 0.0,
            "features": self.feature_extractor.extract(),
        }


inference_service = InferenceService()
