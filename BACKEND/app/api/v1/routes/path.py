from fastapi import APIRouter, Depends
from app.schemas.path import PathResponse
from app.services.lesson_service import LessonService
from app.api.deps import get_current_user, get_lesson_service

router = APIRouter()

@router.get("", response_model=PathResponse)
def read_learning_path(
    current_user_id: int = Depends(get_current_user),
    lesson_service: LessonService = Depends(get_lesson_service)
):
    return lesson_service.get_path(current_user_id)
