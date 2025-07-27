from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SessionResponse(SessionBase):
    id: int
    session_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = Field(alias='session_metadata')
    
    class Config:
        from_attributes = True
        allow_population_by_field_name = True