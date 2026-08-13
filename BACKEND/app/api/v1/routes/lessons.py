from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_lesson_service
from app.services.lesson_service import LessonService
from app.schemas.lesson import StartLessonResponse

router = APIRouter()

@router.post("/{lesson_id}/start", response_model=StartLessonResponse)
def start_lesson(
    lesson_id: int,
    user_id: int = Depends(get_current_user),
    lesson_service: LessonService = Depends(get_lesson_service)
):
    return lesson_service.start_lesson(user_id=user_id, lesson_id=lesson_id)
