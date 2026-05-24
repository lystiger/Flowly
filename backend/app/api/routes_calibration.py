from fastapi import APIRouter, HTTPException, Query

from app.models.calibration import CalibrationProfile, SensorName
from app.services.calibration_service import calibration_service

router = APIRouter(prefix="/api/calibration", tags=["calibration"])


@router.get("/profile", response_model=CalibrationProfile)
async def get_profile():
    return calibration_service.get_profile()


@router.post("/profile", response_model=CalibrationProfile)
async def save_profile(profile: CalibrationProfile):
    return calibration_service.save_profile(profile)


@router.post("/reset", response_model=CalibrationProfile)
async def reset_profile():
    return calibration_service.reset()


@router.post("/set-min/{sensor}", response_model=CalibrationProfile)
async def set_min(sensor: SensorName, value: int = Query(..., ge=0, le=4095)):
    try:
        return calibration_service.set_min(sensor, value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/set-max/{sensor}", response_model=CalibrationProfile)
async def set_max(sensor: SensorName, value: int = Query(..., ge=0, le=4095)):
    try:
        return calibration_service.set_max(sensor, value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/quality")
async def get_quality():
    return calibration_service.quality()
