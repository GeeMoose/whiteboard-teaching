from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db, AsyncSessionLocal
from app.models.explanation import Explanation, ExplanationStatus
from app.models.session import Session
from app.schemas.explanation import ExplanationCreate, ExplanationResponse
from app.services.llm_service import LLMService

router = APIRouter()


@router.post("/", response_model=ExplanationResponse, status_code=status.HTTP_201_CREATED)
async def create_explanation(
    explanation_data: ExplanationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    query = select(Session).where(Session.session_id == explanation_data.session_id)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    explanation = Explanation(
        session_id=session.id,
        question=explanation_data.question,
        status=ExplanationStatus.PENDING,
        metadata=explanation_data.metadata or {}
    )
    
    db.add(explanation)
    await db.commit()
    await db.refresh(explanation)
    
    background_tasks.add_task(process_explanation, explanation.id)
    
    return explanation


@router.get("/", response_model=List[ExplanationResponse])
async def get_explanations(
    session_id: str = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(Explanation).options(selectinload(Explanation.animations))
    
    if session_id:
        session_query = select(Session).where(Session.session_id == session_id)
        session_result = await db.execute(session_query)
        session = session_result.scalar_one_or_none()
        
        if session:
            query = query.where(Explanation.session_id == session.id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    explanations = result.scalars().all()
    
    return explanations


@router.get("/{explanation_id}", response_model=ExplanationResponse)
async def get_explanation(
    explanation_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(Explanation).where(Explanation.id == explanation_id).options(
        selectinload(Explanation.animations)
    )
    result = await db.execute(query)
    explanation = result.scalar_one_or_none()
    
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Explanation not found"
        )
    
    return explanation


async def process_explanation(explanation_id: int):
    async with AsyncSessionLocal() as db:
        query = select(Explanation).where(Explanation.id == explanation_id)
        result = await db.execute(query)
        explanation = result.scalar_one_or_none()
        
        if not explanation:
            return
        
        explanation.status = ExplanationStatus.PROCESSING
        await db.commit()
        
        llm_service = None
        try:
            llm_service = LLMService()
            explanation_text = await llm_service.generate_explanation(explanation.question)
            
            explanation.explanation_text = explanation_text
            explanation.status = ExplanationStatus.COMPLETED
            explanation.llm_provider = llm_service.current_provider
            
        except Exception as e:
            explanation.status = ExplanationStatus.FAILED
            explanation.metadata = {"error": str(e)}
        finally:
            if llm_service:
                await llm_service.close()
        
        await db.commit()