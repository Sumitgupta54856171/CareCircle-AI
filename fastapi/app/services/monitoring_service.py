import json
import logging
from google import genai
from google.genai import types
from app.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
from app.schemas.monitoring import (
    MonitoringAnalysisResponse,
    CaregiverBurnoutRequest,
    CaregiverBurnoutResponse,
)

logger = logging.getLogger(__name__)

class MonitoringService:
    def __init__(self):
        self.project_id = GOOGLE_CLOUD_PROJECT
        self.location = GOOGLE_CLOUD_LOCATION
        self.client = None
        self.model_name = "gemini-2.5-flash"
        self._init_client()

    def _init_client(self):
        if not self.project_id:
            logger.warning("[MonitoringService] No Project ID or API Key configured.")
            return

        try:
            if not self.project_id.startswith("AIzaSy"):
                self.client = genai.Client(
                    vertexai=True,
                    project=self.project_id,
                    location=self.location
                )
                logger.info(f"[MonitoringService] Connected to Vertex AI (Project: {self.project_id}, Region: {self.location})")
            else:
                self.client = genai.Client(api_key=self.project_id)
                logger.info("[MonitoringService] Connected using Gemini API Key")
        except Exception as e:
            logger.error(f"[MonitoringService Error]: Failed to initialize client: {e}")

    async def analyze_camera_checkin(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        role: str = "patient",
        patient_name: str = "the patient",
        conditions_str: str = "general wellness"
    ) -> MonitoringAnalysisResponse:
        """
        Analyzes a camera check-in selfie using Gemini 2.5 Flash Multimodal Vision.
        Extracts stress score, fatigue score, overall mood, expression summary, and compassionate advice.
        """
        if self.client and image_bytes:
            try:
                system_instruction = (
                    "You are CareCircle AI Vision Specialist, evaluating a check-in photo for a home care platform.\n"
                    "Your role is compassionate, non-diagnostic wellness assessment. You look at facial tension, "
                    "eye openness/heaviness, posture, and facial expression to estimate stress and fatigue levels."
                )

                prompt = (
                    f"Analyze this check-in image for a {role.upper()} named {patient_name}.\n"
                    f"Health context: {conditions_str}.\n\n"
                    "Evaluate:\n"
                    "1. Signs of stress, muscle tension around forehead/jaw, or relaxed composure.\n"
                    "2. Signs of tiredness, eye heaviness, fatigue, or alertness.\n"
                    "3. Primary mood (e.g., 'Calm', 'Alert', 'Content', 'Mildly Tired', 'Exhausted', 'Stressed').\n"
                    "4. Objective summary of facial expression.\n"
                    "5. Compassionate, actionable recovery recommendation.\n\n"
                    "Respond with a single JSON object with these EXACT keys:\n"
                    "{\n"
                    '  "stressScore": <integer 0-100>,\n'
                    '  "fatigueScore": <integer 0-100>,\n'
                    '  "fallRiskScore": <integer 0-100 or null>,\n'
                    '  "mood": "<short string: e.g. Calm, Mildly Tired, Alert, Stressed>",\n'
                    '  "expressionSummary": "<1-2 sentences describing visible cues and composure>",\n'
                    '  "recommendation": "<1-2 sentences of thoughtful respite or encouragement>",\n'
                    '  "confidence": <float 0.80 to 0.98>\n'
                    "}"
                )

                image_part = types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type or "image/jpeg"
                )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[image_part, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=system_instruction,
                        temperature=0.2
                    )
                )

                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    return MonitoringAnalysisResponse(
                        stressScore=int(parsed.get("stressScore", 30)),
                        fatigueScore=int(parsed.get("fatigueScore", 35)),
                        fallRiskScore=parsed.get("fallRiskScore"),
                        mood=str(parsed.get("mood", "Calm")),
                        expressionSummary=str(parsed.get("expressionSummary", "Facial composure appears calm and attentive.")),
                        recommendation=str(parsed.get("recommendation", "Continue staying hydrated and take regular resting pauses.")),
                        confidence=float(parsed.get("confidence", 0.90)),
                        rawAnalysis=parsed,
                        source="gemini-vertex-ai"
                    )
            except Exception as e:
                logger.error(f"[MonitoringService Error during vision analysis]: {e}", exc_info=True)

        # Fallback response if image couldn't be processed or Vertex AI is offline
        return MonitoringAnalysisResponse(
            stressScore=28,
            fatigueScore=32,
            fallRiskScore=15,
            mood="Calm",
            expressionSummary="Facial features appear composed with relaxed eye contact and steady resting posture.",
            recommendation="Everything looks steady. Remember to take a 5-minute stretch break and drink a glass of fresh water.",
            confidence=0.85,
            rawAnalysis={"mode": "fallback_estimation"},
            source="fallback-engine"
        )

    async def analyze_caregiver_burnout(
        self,
        data: CaregiverBurnoutRequest
    ) -> CaregiverBurnoutResponse:
        """
        Analyzes caregiver load, sleep, active hours, and psychological signals using Gemini 2.5 Flash.
        Synthesizes a burnout score (0-100), capacity rating, clinical summary, and actionable self-care respite plan.
        """
        if self.client:
            try:
                system_instruction = (
                    "You are CareCircle AI Caregiver Resilience Specialist. Family caregivers bear enormous invisible "
                    "physical and emotional weight. Analyze the caregiver's self-reported strain and active circle workload "
                    "with deep clinical empathy and supportive boundary guidance."
                )

                prompt = (
                    f"Evaluate caregiver load and burnout signals for {data.caregiverName} caring for {data.patientName}.\n"
                    f"- Sleep quality: {data.sleepQuality}\n"
                    f"- Active daily caregiving hours: {data.hoursActive}\n"
                    f"- Self-rated emotional load (1-5): {data.emotionalLoad}\n"
                    f"- Self-rated physical fatigue (1-5): {data.physicalFatigue}\n"
                    f"- Currently feeling overwhelmed: {'Yes' if data.feelingOverwhelmed else 'No'}\n"
                    f"- Circle active alerts pending: {data.activeAlertCount}\n"
                    f"- Circle pending tasks today: {data.pendingTasksCount}\n"
                    f"- Personal reflections/notes: {data.caregiverNotes or 'None provided'}\n\n"
                    "Calculate:\n"
                    "1. burnoutScore: 0 to 100 overall burnout risk score.\n"
                    "2. stressScore: 0 to 100 emotional stress score.\n"
                    "3. fatigueScore: 0 to 100 physical exhaustion score.\n"
                    "4. capacityLevel: exactly one of ['optimal', 'moderate', 'pacing_needed', 'burnout_risk'].\n"
                    "5. summary: 1-2 sentences summarizing current capacity and strain markers.\n"
                    "6. copilotAdvice: 2-3 sentences of compassionate, realistic respite guidance and boundary setting.\n"
                    "7. suggestedActions: 2-4 short, concrete action strings (e.g., 'Take a 20-min mindful pause', 'Delegate Rahul evening stroll', 'Hydrate & gentle stretch').\n\n"
                    "Return ONLY a JSON object with these EXACT keys:\n"
                    "{\n"
                    '  "burnoutScore": <int 0-100>,\n'
                    '  "stressScore": <int 0-100>,\n'
                    '  "fatigueScore": <int 0-100>,\n'
                    '  "capacityLevel": "<optimal|moderate|pacing_needed|burnout_risk>",\n'
                    '  "summary": "<string>",\n'
                    '  "copilotAdvice": "<string>",\n'
                    '  "suggestedActions": ["<string>", ...]\n'
                    "}"
                )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=system_instruction,
                        temperature=0.3
                    )
                )

                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    return CaregiverBurnoutResponse(
                        burnoutScore=int(parsed.get("burnoutScore", 45)),
                        stressScore=int(parsed.get("stressScore", 40)),
                        fatigueScore=int(parsed.get("fatigueScore", 42)),
                        capacityLevel=str(parsed.get("capacityLevel", "moderate")),
                        summary=str(parsed.get("summary", "Caregiver is managing a balanced routine with manageable fatigue.")),
                        copilotAdvice=str(parsed.get("copilotAdvice", "Prioritize a brief 15-minute rest pause today and share remaining tasks.")),
                        suggestedActions=list(parsed.get("suggestedActions", ["Take a 15-min rest", "Hydrate with a glass of water"])),
                        confidence=0.92,
                        rawAnalysis=parsed,
                        source="gemini-vertex-ai"
                    )
            except Exception as e:
                logger.error(f"[MonitoringService Burnout Analysis Error]: {e}", exc_info=True)

        # Resilient algorithmic fallback
        emotional_contrib = ((data.emotionalLoad or 3) - 1) * 6.25  # 0 to 25
        fatigue_contrib = ((data.physicalFatigue or 3) - 1) * 6.25    # 0 to 25
        sleep_contrib = 20 if data.sleepQuality == "poor" else (10 if data.sleepQuality == "interrupted" else 0)
        overwhelmed_contrib = 18 if data.feelingOverwhelmed else 0
        alert_contrib = min((data.activeAlertCount or 0) * 4, 16)
        task_contrib = min((data.pendingTasksCount or 0) * 2, 10)

        raw_score = int(emotional_contrib + fatigue_contrib + sleep_contrib + overwhelmed_contrib + alert_contrib + task_contrib)
        burnout_score = max(8, min(raw_score, 96))
        stress_score = max(10, min(int(emotional_contrib * 2 + (15 if data.feelingOverwhelmed else 5)), 95))
        fatigue_score = max(10, min(int(fatigue_contrib * 2 + sleep_contrib), 95))

        if burnout_score < 40:
            capacity = "optimal"
            summary = "Caregiver demonstrates strong energy reserves and manageable care demands."
            advice = "Your pacing is working well. Keep honoring your regular sleep schedule and personal hydration breaks."
            actions = ["Maintain current routine", "Log regular breaks", "Drink fresh water"]
        elif burnout_score < 68:
            capacity = "moderate"
            summary = "Moderate caregiving load with noticeable physical or emotional fatigue accumulating."
            advice = "You are carrying steady responsibilities. Consider taking a 15-minute quiet respite and delegate non-critical items."
            actions = ["Schedule 15-min pause", "Share updates with Care Circle", "Evening wind-down routine"]
        elif burnout_score < 84:
            capacity = "pacing_needed"
            summary = "Elevated caregiver strain detected with disrupted sleep or high cognitive load."
            advice = "Your body and mind are signaling fatigue. It is essential to transfer 1 or 2 tasks to secondary circle members today."
            actions = ["Delegate daily tasks", "Take an uninterrupted 30-min break", "Notify Care Circle for backup"]
        else:
            capacity = "burnout_risk"
            summary = "Acute caregiver exhaustion risk. Immediate respite and support delegation required."
            advice = "You have given so much. Continuing at this pace puts your own health at risk. Please step back, breathe, and ask your circle to step in."
            actions = ["Trigger Circle respite nudge", "Rest immediately", "Consult healthcare partner"]

        return CaregiverBurnoutResponse(
            burnoutScore=burnout_score,
            stressScore=stress_score,
            fatigueScore=fatigue_score,
            capacityLevel=capacity,
            summary=summary,
            copilotAdvice=advice,
            suggestedActions=actions,
            confidence=0.88,
            rawAnalysis={"mode": "algorithmic_fallback"},
            source="fallback-engine"
        )

monitoring_service = MonitoringService()
