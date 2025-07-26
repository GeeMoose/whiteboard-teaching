from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import os

from app.core.database import get_db, AsyncSessionLocal
from app.models.animation import Animation, AnimationStatus
from app.models.explanation import Explanation
from app.schemas.animation import AnimationCreate, AnimationResponse
from app.services.animation_service import AnimationService

router = APIRouter()


@router.post("/", response_model=AnimationResponse, status_code=status.HTTP_201_CREATED)
async def create_animation(
    animation_data: AnimationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    query = select(Explanation).where(Explanation.id == animation_data.explanation_id)
    result = await db.execute(query)
    explanation = result.scalar_one_or_none()
    
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Explanation not found"
        )
    
    animation = Animation(
        explanation_id=explanation.id,
        title=animation_data.title,
        description=animation_data.description,
        animation_type=animation_data.animation_type,
        status=AnimationStatus.PENDING,
        metadata=animation_data.metadata or {}
    )
    
    db.add(animation)
    await db.commit()
    await db.refresh(animation)
    
    background_tasks.add_task(generate_animation, animation.id)
    
    return animation


@router.get("/", response_model=List[AnimationResponse])
async def get_animations(
    explanation_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(Animation)
    
    if explanation_id:
        query = query.where(Animation.explanation_id == explanation_id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    animations = result.scalars().all()
    
    return animations


@router.get("/{animation_id}", response_model=AnimationResponse)
async def get_animation(
    animation_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(Animation).where(Animation.id == animation_id)
    result = await db.execute(query)
    animation = result.scalar_one_or_none()
    
    if not animation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animation not found"
        )
    
    return animation


@router.get("/{animation_id}/file")
async def get_animation_file(
    animation_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(Animation).where(Animation.id == animation_id)
    result = await db.execute(query)
    animation = result.scalar_one_or_none()
    
    if not animation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animation not found"
        )
    
    if not animation.file_path or not os.path.exists(animation.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animation file not found"
        )
    
    return FileResponse(
        animation.file_path,
        media_type="video/mp4",
        filename=f"animation_{animation_id}.mp4"
    )


@router.get("/{animation_id}/thumbnail")
async def get_animation_thumbnail(
    animation_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(Animation).where(Animation.id == animation_id)
    result = await db.execute(query)
    animation = result.scalar_one_or_none()
    
    if not animation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animation not found"
        )
    
    if not animation.thumbnail_path or not os.path.exists(animation.thumbnail_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animation thumbnail not found"
        )
    
    return FileResponse(
        animation.thumbnail_path,
        media_type="image/png",
        filename=f"thumbnail_{animation_id}.png"
    )


async def generate_animation(animation_id: int):
    async with AsyncSessionLocal() as db:
        query = select(Animation).where(Animation.id == animation_id)
        result = await db.execute(query)
        animation = result.scalar_one_or_none()
        
        if not animation:
            return
        
        animation.status = AnimationStatus.GENERATING
        await db.commit()
        
        try:
            animation_service = AnimationService()
            file_path, thumbnail_path, manim_code, duration = await animation_service.generate_animation(
                animation.title,
                animation.description,
                animation.animation_type
            )
            
            animation.file_path = file_path
            animation.thumbnail_path = thumbnail_path
            animation.manim_code = manim_code
            animation.duration = duration
            animation.status = AnimationStatus.COMPLETED
            
        except Exception as e:
            animation.status = AnimationStatus.FAILED
            animation.metadata = {"error": str(e)}
        
        await db.commit()