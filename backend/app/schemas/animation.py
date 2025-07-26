from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from app.models.animation import AnimationStatus, AnimationType


class AnimationBase(BaseModel):
    title: str
    description: Optional[str] = None
    animation_type: AnimationType = AnimationType.CONCEPTUAL
    metadata: Optional[Dict[str, Any]] = None


class AnimationCreate(AnimationBase):
    explanation_id: int


class AnimationResponse(AnimationBase):
    id: int
    explanation_id: int
    status: AnimationStatus
    file_path: Optional[str] = None
    duration: Optional[float] = None
    thumbnail_path: Optional[str] = None
    manim_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True