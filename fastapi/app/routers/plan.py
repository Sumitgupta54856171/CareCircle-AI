from fastapi import APIRouter
from app.schemas.plan import PlanGenerateRequest, PlanGenerateResponse
from app.services.plan_agent import plan_agent_service

router = APIRouter(tags=["plan"])

@router.post("/plan/generate", response_model=PlanGenerateResponse)
async def generate_adaptive_plan(request: PlanGenerateRequest):
    """
    Executes the 3-node LangGraph Adaptive Planner workflow:
    1. Evaluates patient stress, fatigue, mood, and conditions.
    2. Evaluates caregiver burnout, sleep quality, and active alerts.
    3. Synthesizes a coordinated daily schedule with Gemini 2.5 Flash for both roles.
    """
    plan_response = await plan_agent_service.generate_plan(request)
    return plan_response
