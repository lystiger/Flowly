import pytest

from app.models.calibration import CalibrationProfile, FlexCalibrationRange
from app.services.calibration_service import CalibrationService


def test_normalization_uses_saved_min_max():
    service = CalibrationService()
    profile = CalibrationProfile()
    profile.flex["thumb"] = FlexCalibrationRange(min=100, max=1100)

    service.save_profile(profile)

    assert service.normalize("thumb", 600) == 0.5
    assert service.normalize("thumb", 50) == 0.0
    assert service.normalize("thumb", 1200) == 1.0


def test_set_min_and_max():
    service = CalibrationService()

    service.set_min("index", 200)
    profile = service.set_max("index", 1200)

    assert profile.flex["index"].min == 200
    assert profile.flex["index"].max == 1200


def test_reset_restores_default_profile():
    service = CalibrationService()
    service.set_min("middle", 500)

    profile = service.reset()

    assert profile.flex["middle"].min == 0
    assert profile.flex["middle"].max == 4095


def test_invalid_sensor_rejected():
    service = CalibrationService()

    with pytest.raises(ValueError):
        service.normalize("elbow", 500)


def test_invalid_adc_rejected():
    service = CalibrationService()

    with pytest.raises(ValueError):
        service.set_min("thumb", 5000)
