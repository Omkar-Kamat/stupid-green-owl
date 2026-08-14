from sqlalchemy import update
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.domain import LessonAttempt, AttemptStatus, ExerciseAttempt

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

    def get_attempt_by_id(self, attempt_id: int) -> LessonAttempt | None:
        return self.db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id).first()

    def try_complete_attempt(
        self,
        attempt_id: int,
        user_id: int,
        xp_awarded: int,
        completed_at: datetime,
    ) -> bool:
        """Atomically complete an in-progress attempt; only one caller succeeds."""
        result = self.db.execute(
            update(LessonAttempt)
            .where(
                LessonAttempt.id == attempt_id,
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == AttemptStatus.in_progress,
                LessonAttempt.xp_awarded.is_(None),
            )
            .values(
                status=AttemptStatus.completed,
                xp_awarded=xp_awarded,
                completed_at=completed_at,
                crown_earned=False,
            )
        )
        self.db.flush()
        return result.rowcount == 1

    def create_exercise_attempt(self, exercise_attempt: "ExerciseAttempt") -> "ExerciseAttempt":
        self.db.add(exercise_attempt)
        self.db.flush()
        return exercise_attempt

    def count_exercise_attempts(self, attempt_id: int) -> int:
        return (
            self.db.query(ExerciseAttempt)
            .filter(ExerciseAttempt.lesson_attempt_id == attempt_id)
            .count()
        )
