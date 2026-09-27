from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.medication_vision_service import medication_vision_service
from app.schemas.medication import MedicationVerificationResponse

router = APIRouter(tags=["medications"])

@router.post("/analyze/medication-photo", response_model=MedicationVerificationResponse)
async def analyze_medication_photo(
    file: UploadFile = File(...),
    medicationName: Optional[str] = Form("Medication"),
    dosage: Optional[str] = Form("Standard dose"),
    instructions: Optional[str] = Form("Take with water"),
    patientName: Optional[str] = Form("the patient")
):
    """
    Receives medication photo confirmation snapshot and uses Gemini 2.5 Flash Multimodal Vision
    to verify dose adherence, packaging match, and consumption status.
    """
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    result = await medication_vision_service.analyze_medication_photo(
        image_bytes=image_bytes,
        mime_type=mime_type,
        med_name=medicationName,
        dosage=dosage,
        instructions=instructions,
        patient_name=patientName
    )
    return result
