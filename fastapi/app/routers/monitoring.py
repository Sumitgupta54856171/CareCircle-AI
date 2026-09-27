from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.monitoring_service import monitoring_service
from app.schemas.monitoring import (
    MonitoringAnalysisResponse,
    CaregiverBurnoutRequest,
    CaregiverBurnoutResponse,
)

router = APIRouter(tags=["monitoring"])

@router.post("/analyze/monitoring", response_model=MonitoringAnalysisResponse)
async def analyze_monitoring(
    file: UploadFile = File(...),
    role: Optional[str] = Form("patient"),
    patientName: Optional[str] = Form("the patient"),
    conditions: Optional[str] = Form("general wellness")
):
    """
    Receives camera check-in snapshot and uses Gemini 2.5 Flash Multimodal Vision
    to assess stress, fatigue, mood, and wellness.
    """
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    result = await monitoring_service.analyze_camera_checkin(
        image_bytes=image_bytes,
        mime_type=mime_type,
        role=role,
        patient_name=patientName,
        conditions_str=conditions
    )
    return result

@router.post("/analyze/caregiver-burnout", response_model=CaregiverBurnoutResponse)
async def analyze_caregiver_burnout(request: CaregiverBurnoutRequest):
    """
    Evaluates caregiver emotional strain, sleep deficits, active hours, and workload
    using Gemini 2.5 Flash to generate real-time burnout signals, capacity ratings,
    and a supportive respite plan.
    """
    result = await monitoring_service.analyze_caregiver_burnout(request)
    return result
