from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    role: Optional[str] = "patient"
    userName: Optional[str] = "User"
    patientName: Optional[str] = "Patient"
    conditions: Optional[List[str]] = []
    medications: Optional[List[Dict[str, Any]]] = []
    alerts: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    reply: str
    source: str
    model: Optional[str] = None
