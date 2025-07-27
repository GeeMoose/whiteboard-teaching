from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class AnimationStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class AnimationType(str, enum.Enum):
    MATHEMATICAL = "mathematical"
    CONCEPTUAL = "conceptual"
    PROCEDURAL = "procedural"
    INTERACTIVE = "interactive"


class Animation(Base):
    __tablename__ = "animations"

    id = Column(Integer, primary_key=True, index=True)
    explanation_id = Column(Integer, ForeignKey("explanations.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    animation_type = Column(Enum(AnimationType), default=AnimationType.CONCEPTUAL)
    status = Column(Enum(AnimationStatus), default=AnimationStatus.PENDING)
    file_path = Column(String)
    duration = Column(Float)
    thumbnail_path = Column(String)
    manim_code = Column(Text)
    animation_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    explanation = relationship("Explanation", back_populates="animations")