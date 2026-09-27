from pydantic import BaseModel, Field
from typing import Optional

class MedicationVerificationResponse(BaseModel):
    isMatch: bool = Field(..., description="Whether packaging or pill matches the prescribed medication")
    isTaken: bool = Field(..., description="Whether evidence shows the medication is taken or packaging opened/consumed")
    confidence: float = Field(0.9, description="Confidence score from 0.0 to 1.0")
    notes: str = Field(..., description="Clinical verification summary from AI Vision")
    detectedDetails: Optional[str] = Field(None, description="Any detected label text, pill shape/color, or blister status")
    source: str = "gemini-vertex-ai"
