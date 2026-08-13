from sqlalchemy.orm import Session
from app.models.domain import LessonAttempt, AttemptStatus

class AttemptRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_attempt(self, user_id: int, lesson_id: int) -> LessonAttempt | None:
        return self.db.query(LessonAttempt).filter(
            LessonAttempt.user_id == user_id,
            LessonAttempt.lesson_id == lesson_id,
            LessonAttempt.status == AttemptStatus.in_progress
        ).first()

    def create_attempt(self, attempt: LessonAttempt) -> LessonAttempt:
        self.db.add(attempt)
        self.db.flush()
        return attempt
