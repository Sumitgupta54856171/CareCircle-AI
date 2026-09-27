from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
from app.routers.copilot import router as copilot_router

app = FastAPI(
    title="CareCircle AI Service",
    description="Microservice for Multimodal AI, Vertex AI Co-Pilot, and Adaptive Daily Planning",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(copilot_router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "CareCircle AI Microservice",
        "project": GOOGLE_CLOUD_PROJECT,
        "location": GOOGLE_CLOUD_LOCATION,
        "features": ["modular-architecture", "vertex-ai", "gemini-2.5-flash", "co-pilot-chat"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}