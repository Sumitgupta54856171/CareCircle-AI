from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/copilot", tags=["AI Co-Pilot"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    return await gemini_service.generate_response(req)
