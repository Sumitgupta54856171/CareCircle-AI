from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class MonitoringAnalysisResponse(BaseModel):
    stressScore: int = Field(..., description="Estimated stress score from 0 (very relaxed) to 100 (high stress)")
    fatigueScore: int = Field(..., description="Estimated fatigue score from 0 (energized) to 100 (exhausted)")
    fallRiskScore: Optional[int] = Field(None, description="Optional fall risk score from 0 to 100")
    mood: str = Field(..., description="Assessed mood label, e.g. Calm, Alert, Tired, Stressed, Cheerful")
    expressionSummary: str = Field(..., description="Objective summary of facial cues, posture, and alertness")
    recommendation: str = Field(..., description="Empathetic, actionable recovery guidance")
    confidence: float = Field(0.85, description="Confidence level of analysis (0.0 to 1.0)")
    rawAnalysis: Optional[Dict[str, Any]] = None
    source: str = "gemini-vertex-ai"
