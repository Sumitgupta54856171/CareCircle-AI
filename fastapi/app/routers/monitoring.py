from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.monitoring_service import monitoring_service
from app.schemas.monitoring import MonitoringAnalysisResponse

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
