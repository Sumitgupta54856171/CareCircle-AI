from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

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

class CaregiverBurnoutRequest(BaseModel):
    caregiverName: Optional[str] = "Caregiver"
    patientName: Optional[str] = "Patient"
    sleepQuality: Optional[str] = "interrupted"  # "restful", "interrupted", "poor"
    hoursActive: Optional[float] = 8.0
    emotionalLoad: Optional[int] = 3  # 1 (low) to 5 (overwhelmed)
    physicalFatigue: Optional[int] = 3  # 1 (energized) to 5 (exhausted)
    feelingOverwhelmed: Optional[bool] = False
    activeAlertCount: Optional[int] = 0
    pendingTasksCount: Optional[int] = 0
    caregiverNotes: Optional[str] = None

class CaregiverBurnoutResponse(BaseModel):
    burnoutScore: int = Field(..., description="Estimated burnout score 0-100")
    stressScore: int = Field(..., description="Estimated emotional stress score 0-100")
    fatigueScore: int = Field(..., description="Estimated physical fatigue 0-100")
    capacityLevel: str = Field(..., description="optimal | moderate | pacing_needed | burnout_risk")
    summary: str = Field(..., description="Clinical observation and burnout risk summary")
    copilotAdvice: str = Field(..., description="Actionable respite, boundaries, and self-care steps")
    suggestedActions: List[str] = Field(default_factory=list)
    confidence: float = Field(0.90)
    rawAnalysis: Optional[Dict[str, Any]] = None
    source: str = "gemini-vertex-ai"
