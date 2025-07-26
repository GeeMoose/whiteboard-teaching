from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.models.explanation import ExplanationStatus


class ExplanationBase(BaseModel):
    question: str
    metadata: Optional[Dict[str, Any]] = None


class ExplanationCreate(ExplanationBase):
    session_id: str


class ExplanationResponse(ExplanationBase):
    id: int
    session_id: int
    explanation_text: Optional[str] = None
    status: ExplanationStatus
    llm_provider: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True