import json
import logging
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from google import genai
from google.genai import types
from app.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
from app.schemas.plan import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    AdaptiveTaskItem,
)

logger = logging.getLogger(__name__)

# State schema for the LangGraph workflow
class PlannerGraphState(TypedDict, total=False):
    # Inputs
    caregiver_name: str
    patient_name: str
    patient_conditions: List[str]
    patient_stress_score: int
    patient_fatigue_score: int
    patient_mood: str
    caregiver_burnout_score: int
    caregiver_capacity_level: str
    caregiver_sleep_quality: str
    recent_adherence_rate: int
    active_alerts_count: int

    # Evaluated Intermediate Nodes
    patient_posture: str
    patient_energy_level: str
    caregiver_allowance: str
    caregiver_capacity: str
    focus_themes: List[str]

    # Final Output
    ai_reasoning: str
    patient_tasks: List[Dict[str, Any]]
    caregiver_tasks: List[Dict[str, Any]]
    graph_metadata: Dict[str, Any]

class PlanAgentService:
    def __init__(self):
        self.project_id = GOOGLE_CLOUD_PROJECT
        self.location = GOOGLE_CLOUD_LOCATION
        self.client = None
        self.model_name = "gemini-2.5-flash"
        self._init_client()
        self.workflow = self._build_langgraph_workflow()

    def _init_client(self):
        if not self.project_id:
            logger.warning("[PlanAgent] No Google Cloud Project ID configured.")
            return

        try:
            if not self.project_id.startswith("AIzaSy"):
                self.client = genai.Client(
                    vertexai=True,
                    project=self.project_id,
                    location=self.location
                )
                logger.info(f"[PlanAgent] Connected to Vertex AI (Project: {self.project_id}, Region: {self.location})")
            else:
                self.client = genai.Client(api_key=self.project_id)
                logger.info("[PlanAgent] Connected using Gemini API Key")
        except Exception as e:
            logger.error(f"[PlanAgent Error]: Failed to initialize client: {e}")

    # LangGraph Node 1: Patient Biometric & Condition Evaluator
    def _evaluate_patient_state(self, state: PlannerGraphState) -> Dict[str, Any]:
        fatigue = state.get("patient_fatigue_score", 35)
        stress = state.get("patient_stress_score", 30)
        conditions = state.get("patient_conditions", [])
        adherence = state.get("recent_adherence_rate", 85)

        themes = []
        if any("stroke" in c.lower() for c in conditions):
            themes.append("stroke_rehab")
        if any("diabetes" in c.lower() for c in conditions):
            themes.append("glycemic_control")
        if any("hypertension" in c.lower() or "cardiac" in c.lower() for c in conditions):
            themes.append("cardio_pacing")

        if adherence < 75:
            themes.append("adherence_support")

        if fatigue >= 60 or stress >= 65:
            posture = "restorative"
            energy_level = "Low (Pacing & Restorative Focus)"
            themes.append("gentle_respite")
        elif fatigue <= 35 and stress <= 40:
            posture = "active_rehabilitation"
            energy_level = "High (Active Rehabilitation)"
            themes.append("progressive_mobility")
        else:
            posture = "balanced"
            energy_level = "Moderate (Balanced Routine)"
            themes.append("steady_routine")

        return {
            "patient_posture": posture,
            "patient_energy_level": energy_level,
            "focus_themes": themes
        }

    # LangGraph Node 2: Caregiver Capacity & Burnout Evaluator
    def _evaluate_caregiver_capacity(self, state: PlannerGraphState) -> Dict[str, Any]:
        burnout = state.get("caregiver_burnout_score", 40)
        sleep = state.get("caregiver_sleep_quality", "interrupted")
        alerts_count = state.get("active_alerts_count", 0)

        if burnout >= 70 or sleep == "poor" or alerts_count >= 3:
            allowance = "minimal_respite"
            capacity = "Low (Mandatory Respite & Task Transfer)"
        elif burnout < 40 and sleep == "restful" and alerts_count == 0:
            allowance = "full_engagement"
            capacity = "High (Optimal Engagement)"
        else:
            allowance = "balanced_support"
            capacity = "Medium (Balanced Caregiving)"

        return {
            "caregiver_allowance": allowance,
            "caregiver_capacity": capacity
        }

    # LangGraph Node 3: Gemini Multimodal & Clinical Synthesizer
    def _synthesize_adaptive_tasks(self, state: PlannerGraphState) -> Dict[str, Any]:
        patient_name = state.get("patient_name", "Patient")
        caregiver_name = state.get("caregiver_name", "Caregiver")
        conditions = state.get("patient_conditions", [])
        conditions_str = ", ".join(conditions) if conditions else "general wellness"
        posture = state.get("patient_posture", "balanced")
        energy_level = state.get("patient_energy_level", "Moderate")
        allowance = state.get("caregiver_allowance", "balanced_support")
        capacity = state.get("caregiver_capacity", "Medium")
        fatigue = state.get("patient_fatigue_score", 35)
        stress = state.get("patient_stress_score", 30)
        burnout = state.get("caregiver_burnout_score", 40)
        adherence = state.get("recent_adherence_rate", 85)

        if self.client:
            try:
                system_instruction = (
                    "You are CareCircle AI LangGraph Adaptive Daily Plan Synthesizer.\n"
                    "Your role is to orchestrate a personalized, coordinated daily schedule for both Patient and Caregiver.\n"
                    "CRITICAL RULES:\n"
                    "1. If patient posture is 'restorative', prescribe low-exertion, seated, breathwork, and hydration tasks.\n"
                    "2. If patient posture is 'active_rehabilitation', include progressive mobility, therapy exercises matching conditions.\n"
                    "3. If caregiver allowance is 'minimal_respite', strictly limit caregiver tasks to 1-2 essential checks and ALWAYS assign a 20-min caregiver self-care respite task.\n"
                    "4. Include exact categories: 'rehab', 'medication', 'exercise', 'rest', 'checkin', 'support', 'monitoring', 'self_care', 'coordination'.\n"
                    "5. Output valid JSON with exact keys: 'aiReasoning', 'patientTasks', 'caregiverTasks'."
                )

                prompt = (
                    f"Create an adaptive daily plan for today:\n"
                    f"PATIENT CONTEXT:\n"
                    f"- Name: {patient_name}\n"
                    f"- Chronic conditions: {conditions_str}\n"
                    f"- Biometrics: Fatigue={fatigue}%, Stress={stress}%, Mood={state.get('patient_mood', 'Calm')}\n"
                    f"- Evaluated Posture: {posture} ({energy_level})\n"
                    f"- Recent 7-day adherence rate: {adherence}%\n\n"
                    f"CAREGIVER CONTEXT:\n"
                    f"- Name: {caregiver_name}\n"
                    f"- Workload & Burnout: Burnout score={burnout}%, Sleep={state.get('caregiver_sleep_quality', 'interrupted')}\n"
                    f"- Evaluated Capacity: {allowance} ({capacity})\n\n"
                    "Generate:\n"
                    "1. 'aiReasoning': 2-3 sentences explaining exactly how the patient's fatigue/stress and the caregiver's burnout shaped today's task difficulty and distribution.\n"
                    "2. 'patientTasks': 3 to 4 tailored tasks with id (pt-1, pt-2..), title, description, category, estimatedMinutes (5-30).\n"
                    "3. 'caregiverTasks': 2 to 4 tailored tasks with id (ct-1, ct-2..), title, description, category, estimatedMinutes (5-30).\n\n"
                    "Return ONLY valid JSON matching this schema:\n"
                    "{\n"
                    '  "aiReasoning": "<clinical reasoning string>",\n'
                    '  "patientTasks": [\n'
                    '    { "id": "pt-1", "title": "...", "description": "...", "category": "...", "status": "pending", "estimatedMinutes": 15 }\n'
                    "  ],\n"
                    '  "caregiverTasks": [\n'
                    '    { "id": "ct-1", "title": "...", "description": "...", "category": "...", "status": "pending", "estimatedMinutes": 15 }\n'
                    "  ]\n"
                    "}"
                )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=system_instruction,
                        temperature=0.25
                    )
                )

                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    return {
                        "ai_reasoning": parsed.get("aiReasoning", f"Plan dynamically adjusted for {patient_name} ({energy_level}) and {caregiver_name} ({capacity})."),
                        "patient_tasks": parsed.get("patientTasks", []),
                        "caregiver_tasks": parsed.get("caregiverTasks", []),
                        "graph_metadata": {
                            "pipeline": "langgraph-gemini-vertex-ai",
                            "patient_posture": posture,
                            "caregiver_allowance": allowance
                        }
                    }
            except Exception as e:
                logger.error(f"[PlanAgent LangGraph Synthesizer Error]: {e}", exc_info=True)

        # Resilient algorithmic fallback matching conditions and posture
        is_stroke = any("stroke" in c.lower() for c in conditions)
        is_diabetes = any("diabetes" in c.lower() for c in conditions)

        if posture == "restorative":
            patient_tasks = [
                {
                    "id": "pt-1",
                    "title": "Gentle diaphragmatic breathing & seated relaxation",
                    "description": "5 minutes of slow rhythmic breathing to soothe nervous system and relieve elevated fatigue.",
                    "category": "rest",
                    "status": "pending",
                    "estimatedMinutes": 10,
                },
                {
                    "id": "pt-2",
                    "title": "Hydration check & scheduled medications",
                    "description": "Drink 250ml water with morning prescriptions.",
                    "category": "medication",
                    "status": "pending",
                    "estimatedMinutes": 5,
                },
                {
                    "id": "pt-3",
                    "title": "Passive leg and arm elevation rest",
                    "description": "Support limbs in comfortable resting position to promote circulation without strain.",
                    "category": "rehab" if is_stroke else "rest",
                    "status": "pending",
                    "estimatedMinutes": 20,
                }
            ]
        elif posture == "active_rehabilitation":
            patient_tasks = [
                {
                    "id": "pt-1",
                    "title": "Targeted bilateral mobility & range of motion exercises" if is_stroke else "Active morning stretch & core activation",
                    "description": "15 minutes of guided therapeutic movement while energy levels are optimal.",
                    "category": "rehab",
                    "status": "pending",
                    "estimatedMinutes": 15,
                },
                {
                    "id": "pt-2",
                    "title": "Glucose check & scheduled medications" if is_diabetes else "Medication confirmation & hydration log",
                    "description": "Take prescribed dose and confirm adherence via photo check.",
                    "category": "medication",
                    "status": "pending",
                    "estimatedMinutes": 5,
                },
                {
                    "id": "pt-3",
                    "title": "20-minute indoor or outdoor walking cadence",
                    "description": "Steady endurance walking with steady pacing.",
                    "category": "exercise",
                    "status": "pending",
                    "estimatedMinutes": 20,
                },
                {
                    "id": "pt-4",
                    "title": "Cognitive rehabilitation or reading session",
                    "description": "15 minutes of light focus or memory exercises.",
                    "category": "rehab",
                    "status": "pending",
                    "estimatedMinutes": 15,
                }
            ]
        else: # Balanced
            patient_tasks = [
                {
                    "id": "pt-1",
                    "title": "Seated posture alignment & gentle limb stretching",
                    "description": "10 minutes of low-impact mobility to relieve joint stiffness.",
                    "category": "exercise",
                    "status": "pending",
                    "estimatedMinutes": 10,
                },
                {
                    "id": "pt-2",
                    "title": "Morning medication intake & hydration check",
                    "description": "Take morning dose with full glass of water.",
                    "category": "medication",
                    "status": "pending",
                    "estimatedMinutes": 5,
                },
                {
                    "id": "pt-3",
                    "title": "Midday cognitive rest & sensory reset",
                    "description": "15 minutes of eyes-closed quiet time.",
                    "category": "rest",
                    "status": "pending",
                    "estimatedMinutes": 15,
                },
                {
                    "id": "pt-4",
                    "title": "Evening gentle stroll & mobility cooldown",
                    "description": "Relaxed 10-minute movement before dinner.",
                    "category": "exercise",
                    "status": "pending",
                    "estimatedMinutes": 10,
                }
            ]

        # Caregiver tasks strictly calibrated to burnout score
        if allowance == "minimal_respite":
            caregiver_tasks = [
                {
                    "id": "ct-1",
                    "title": "Essential medication & hydration verification",
                    "description": "Quick 5-minute visual check of morning medication dose.",
                    "category": "monitoring",
                    "status": "pending",
                    "estimatedMinutes": 5,
                },
                {
                    "id": "ct-2",
                    "title": "Mandatory 20-minute caregiver respite & mindfulness pause",
                    "description": "Step away from care duties to recharge. Your circle has been alerted to provide backup.",
                    "category": "self_care",
                    "status": "pending",
                    "estimatedMinutes": 20,
                },
                {
                    "id": "ct-3",
                    "title": "Delegate evening patient check to secondary circle member",
                    "description": "Transfer evening coordination to family member to protect your recovery.",
                    "category": "coordination",
                    "status": "pending",
                    "estimatedMinutes": 5,
                }
            ]
        else:
            caregiver_tasks = [
                {
                    "id": "ct-1",
                    "title": "Review morning vitals, adherence & hydration",
                    "description": "Check that medication was taken and review facial check-in score.",
                    "category": "monitoring",
                    "status": "pending",
                    "estimatedMinutes": 10,
                },
                {
                    "id": "ct-2",
                    "title": "Prepare balanced low-sodium nutrition plan",
                    "description": "Prepare wholesome meal supporting condition recovery goals.",
                    "category": "support",
                    "status": "pending",
                    "estimatedMinutes": 20,
                },
                {
                    "id": "ct-3",
                    "title": "15-minute caregiver personal recharge break",
                    "description": "Quiet time for reading, fresh air, or hydration to prevent fatigue buildup.",
                    "category": "self_care",
                    "status": "pending",
                    "estimatedMinutes": 15,
                }
            ]

        reasoning = (
            f"LangGraph synthesized an adaptive routine based on {patient_name}'s {energy_level} "
            f"(Fatigue: {fatigue}%, Stress: {stress}%) and {caregiver_name}'s {capacity} "
            f"(Burnout: {burnout}%). Task intensities and caregiver burdens were dynamically balanced."
        )

        return {
            "ai_reasoning": reasoning,
            "patient_tasks": patient_tasks,
            "caregiver_tasks": caregiver_tasks,
            "graph_metadata": {
                "pipeline": "langgraph-algorithmic-fallback",
                "patient_posture": posture,
                "caregiver_allowance": allowance
            }
        }

    def _build_langgraph_workflow(self):
        """
        Builds and compiles the 3-node LangGraph StateGraph pipeline.
        """
        workflow = StateGraph(PlannerGraphState)

        # Add Nodes
        workflow.add_node("evaluate_patient", self._evaluate_patient_state)
        workflow.add_node("evaluate_caregiver", self._evaluate_caregiver_capacity)
        workflow.add_node("synthesize_plan", self._synthesize_adaptive_tasks)

        # Add Sequential Flow Edges
        workflow.set_entry_point("evaluate_patient")
        workflow.add_edge("evaluate_patient", "evaluate_caregiver")
        workflow.add_edge("evaluate_caregiver", "synthesize_plan")
        workflow.add_edge("synthesize_plan", END)

        # Compile Graph
        return workflow.compile()

    async def generate_plan(self, req: PlanGenerateRequest) -> PlanGenerateResponse:
        """
        Executes the compiled LangGraph workflow with input signals and returns the structured plan.
        """
        initial_state: PlannerGraphState = {
            "caregiver_name": req.caregiverName or "Caregiver",
            "patient_name": req.patientName or "Patient",
            "patient_conditions": req.patientConditions or [],
            "patient_stress_score": req.patientStressScore or 30,
            "patient_fatigue_score": req.patientFatigueScore or 35,
            "patient_mood": req.patientMood or "Calm",
            "caregiver_burnout_score": req.caregiverBurnoutScore or 40,
            "caregiver_capacity_level": req.caregiverCapacityLevel or "moderate",
            "caregiver_sleep_quality": req.caregiverSleepQuality or "interrupted",
            "recent_adherence_rate": req.recentAdherenceRate or 85,
            "active_alerts_count": req.activeAlertsCount or 0,
        }

        # Run compiled LangGraph pipeline
        result = self.workflow.invoke(initial_state)

        # Convert task dicts to AdaptiveTaskItem
        p_tasks = [
            AdaptiveTaskItem(
                id=t.get("id", f"pt-{i+1}"),
                title=t.get("title", "Task"),
                description=t.get("description", ""),
                category=t.get("category", "general"),
                status=t.get("status", "pending"),
                estimatedMinutes=int(t.get("estimatedMinutes", 15))
            )
            for i, t in enumerate(result.get("patient_tasks", []))
        ]

        c_tasks = [
            AdaptiveTaskItem(
                id=t.get("id", f"ct-{i+1}"),
                title=t.get("title", "Support Task"),
                description=t.get("description", ""),
                category=t.get("category", "support"),
                status=t.get("status", "pending"),
                estimatedMinutes=int(t.get("estimatedMinutes", 15))
            )
            for i, t in enumerate(result.get("caregiver_tasks", []))
        ]

        return PlanGenerateResponse(
            aiReasoning=result.get("ai_reasoning", "Adaptive plan synthesized via LangGraph agent."),
            patientEnergyLevel=result.get("patient_energy_level", "Moderate (Balanced)"),
            caregiverCapacity=result.get("caregiver_capacity", "Medium (Balanced)"),
            patientTasks=p_tasks,
            caregiverTasks=c_tasks,
            graphExecutionMetadata=result.get("graph_metadata"),
            source="langgraph-gemini-planner"
        )

plan_agent_service = PlanAgentService()
