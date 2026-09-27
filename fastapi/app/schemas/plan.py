from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AdaptiveTaskItem(BaseModel):
    id: str = Field(..., description="Unique task ID, e.g. pt-1 or ct-1")
    title: str = Field(..., description="Actionable title of the daily task")
    description: str = Field("", description="Guidance notes and instructions")
    category: str = Field("general", description="rehab | medication | exercise | rest | checkin | support | monitoring | self_care | coordination")
    status: str = Field("pending", description="pending | completed | skipped")
    estimatedMinutes: int = Field(15, description="Estimated duration in minutes")

class PlanGenerateRequest(BaseModel):
    caregiverName: Optional[str] = "Caregiver"
    patientName: Optional[str] = "Patient"
    patientConditions: Optional[List[str]] = Field(default_factory=list)
    patientStressScore: Optional[int] = 30
    patientFatigueScore: Optional[int] = 35
    patientMood: Optional[str] = "Calm"
    caregiverBurnoutScore: Optional[int] = 40
    caregiverCapacityLevel: Optional[str] = "moderate"
    caregiverSleepQuality: Optional[str] = "interrupted"
    recentAdherenceRate: Optional[int] = 85
    activeAlertsCount: Optional[int] = 0

class PlanGenerateResponse(BaseModel):
    aiReasoning: str = Field(..., description="Detailed explanation of how biometric scores and caregiver capacity shaped today's plan")
    patientEnergyLevel: str = Field("Moderate (Balanced)", description="Assessed patient energy state")
    caregiverCapacity: str = Field("Medium (Balanced)", description="Assessed caregiver workload allocation")
    patientTasks: List[AdaptiveTaskItem] = Field(default_factory=list)
    caregiverTasks: List[AdaptiveTaskItem] = Field(default_factory=list)
    graphExecutionMetadata: Optional[Dict[str, Any]] = None
    source: str = "langgraph-gemini-planner"
