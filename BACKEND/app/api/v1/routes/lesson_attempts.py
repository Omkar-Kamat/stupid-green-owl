from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_lesson_service
from app.services.lesson_service import LessonService
from app.schemas.lesson import AnswerRequest, AnswerResponse, CompleteResponse

router = APIRouter()

@router.post("/{attempt_id}/answers", response_model=AnswerResponse)
def submit_answer(
    attempt_id: int,
    request: AnswerRequest,
    user_id: int = Depends(get_current_user),
    lesson_service: LessonService = Depends(get_lesson_service)
):
    return lesson_service.submit_answer(user_id=user_id, attempt_id=attempt_id, req=request)

@router.post("/{attempt_id}/complete", response_model=CompleteResponse)
def complete_lesson(
    attempt_id: int,
    user_id: int = Depends(get_current_user),
    lesson_service: LessonService = Depends(get_lesson_service)
):
    return lesson_service.complete_lesson(user_id=user_id, attempt_id=attempt_id)
