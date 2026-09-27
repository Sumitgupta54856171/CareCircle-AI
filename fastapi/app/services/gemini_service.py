from google import genai
from app.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
from app.schemas.chat import ChatRequest, ChatResponse

class GeminiService:
    def __init__(self):
        self.project_id = GOOGLE_CLOUD_PROJECT
        self.location = GOOGLE_CLOUD_LOCATION
        self.client = None
        self.model_name = "gemini-2.5-flash"
        self._init_client()

    def _init_client(self):
        if not self.project_id:
            print("[GeminiService] Warning: No Project ID or API Key configured.")
            return

        try:
            # Vertex AI initialization using Project ID
            if not self.project_id.startswith("AIzaSy"):
                self.client = genai.Client(
                    vertexai=True,
                    project=self.project_id,
                    location=self.location
                )
                print(f"[GeminiService] Connected to Vertex AI (Project: {self.project_id}, Region: {self.location})")
            else:
                self.client = genai.Client(api_key=self.project_id)
                print("[GeminiService] Connected using Gemini API Key")
        except Exception as e:
            print(f"[GeminiService Error]: Failed to initialize client: {e}")

    async def generate_response(self, req: ChatRequest) -> ChatResponse:
        user_msg = req.message.strip()
        role = req.role or "patient"
        patient_name = req.patientName or "the patient"
        conditions_str = ", ".join(req.conditions) if req.conditions else "general recovery"

        # Try Vertex AI first
        if self.client:
            try:
                med_list_str = ""
                if req.medications:
                    med_list_str = "\nCurrent Scheduled Medications: " + "; ".join(
                        [f"{m.get('name')} ({m.get('dosage')}) at {', '.join(m.get('times', []))}" for m in req.medications]
                    )

                alerts_str = ""
                if req.alerts:
                    alerts_str = "\nActive Care Circle Alerts: " + "; ".join(
                        [f"[{a.get('severity', 'medium').upper()}] {a.get('title')}: {a.get('message')}" for a in req.alerts]
                    )

                prompt = (
                    f"You are the CareCircle AI Co-Pilot, an empathetic, supportive, and clinical-grade health assistant.\n"
                    f"You are conversing with the {role.upper()} of the Care Circle.\n"
                    f"User Name: {req.userName}\n"
                    f"Primary Patient: {patient_name}\n"
                    f"Tracked Health Conditions: {conditions_str}{med_list_str}{alerts_str}\n\n"
                    f"Guiding Principles:\n"
                    f"1. Be empathetic, encouraging, and clear.\n"
                    f"2. If answering about medications, cite the user's scheduled medications listed above.\n"
                    f"3. If there are active alerts or the user feels tired/stressed, provide thoughtful respite and recovery advice.\n"
                    f"4. Keep replies concise and easy to read (2-4 sentences max).\n\n"
                    f"User message: {user_msg}"
                )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )

                if response and response.text:
                    return ChatResponse(
                        reply=response.text.strip(),
                        source="gemini-vertex-ai",
                        model=self.model_name
                    )
            except Exception as e:
                print(f"[GeminiService Vertex AI Error]: {e}")

        # Fallback engine
        return ChatResponse(
            reply=(
                f"Hello {req.userName}. I am tracking {patient_name}'s recovery from {conditions_str}. "
                f"Please remember to take regular rest breaks and stay hydrated. How can I assist you right now?"
            ),
            source="fallback-engine",
            model=None
        )

gemini_service = GeminiService()
