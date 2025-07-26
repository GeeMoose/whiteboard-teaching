from fastapi import APIRouter

from app.api.endpoints import sessions, explanations, animations

router = APIRouter()

router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
router.include_router(explanations.router, prefix="/explanations", tags=["explanations"])
router.include_router(animations.router, prefix="/animations", tags=["animations"])