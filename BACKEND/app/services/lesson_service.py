from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.attempt_repository import AttemptRepository
from app.repositories.user_repository import UserStatsRepository
from app.schemas.path import PathResponse, UnitResponse, SkillPathResponse
from app.schemas.lesson import StartLessonResponse, ExerciseResponse
from app.core.config import settings
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError
from app.models.domain import LessonAttempt, AttemptStatus
from sqlalchemy.exc import IntegrityError

class LessonService:
    def __init__(
        self, 
        lesson_repo: LessonRepository, 
        progress_repo: ProgressRepository,
        attempt_repo: AttemptRepository,
        user_stats_repo: UserStatsRepository
    ):
        self.lesson_repo = lesson_repo
        self.progress_repo = progress_repo
        self.attempt_repo = attempt_repo
        self.user_stats_repo = user_stats_repo

    def get_path(self, user_id: int) -> PathResponse:
        units = self.lesson_repo.get_course_tree(course_id=settings.DEFAULT_COURSE_ID)
        user_progress = self.progress_repo.get_user_progress(user_id)
        
        unit_responses = []
        is_first_skill_overall = True

        for unit in units:
            sorted_skills = sorted(unit.skills, key=lambda s: s.order_index)
            skill_responses = []
            
            for skill in sorted_skills:
                progress = user_progress.get(skill.id)
                crown_level = progress.crown_level if progress else 0
                
                # Trust the database state if it exists. 
                # Only derive default initial state if no progress record exists.
                if progress:
                    status = progress.status.value
                    is_first_skill_overall = False
                elif is_first_skill_overall:
                    status = "available"
                    is_first_skill_overall = False
                else:
                    status = "locked"
                
                skill_responses.append(
                    SkillPathResponse(
                        id=skill.id,
                        title=skill.title,
                        icon=skill.icon,
                        status=status,
                        crown_level=crown_level
                    )
                )
                
            unit_responses.append(
                UnitResponse(
                    id=unit.id,
                    title=unit.title,
                    color_theme=unit.color_theme,
                    skills=skill_responses
                )
            )
            
        return PathResponse(units=unit_responses)

    def start_lesson(self, user_id: int, lesson_id: int) -> StartLessonResponse:
        lesson = self.lesson_repo.get_lesson_with_exercises(lesson_id)
        if not lesson:
            raise NotFoundError("LESSON", lesson_id)
        
        if not lesson.exercises:
            raise ConflictError("LESSON_HAS_NO_EXERCISES")
            
        path = self.get_path(user_id)
        skill_status = "locked"
        for unit in path.units:
            for skill in unit.skills:
                if skill.id == lesson.skill_id:
                    skill_status = skill.status.value
                    break
        
        if skill_status == "locked":
            raise ForbiddenError("SKILL_LOCKED")
            
        stats = self.user_stats_repo.get_stats_by_user_id(user_id)
        hearts_remaining = stats.hearts if stats else 5
        
        for attempt_idx in range(2):
            active_attempt = self.attempt_repo.get_active_attempt(user_id, lesson_id)
            if active_attempt:
                return self._build_start_response(active_attempt, hearts_remaining, lesson.exercises)
            
            new_attempt = LessonAttempt(
                user_id=user_id,
                lesson_id=lesson_id,
                status=AttemptStatus.in_progress,
                current_exercise_index=0,
                hearts_lost=0,
                xp_awarded=None
            )
            try:
                self.attempt_repo.create_attempt(new_attempt)
                self.attempt_repo.db.commit()
                return self._build_start_response(new_attempt, hearts_remaining, lesson.exercises)
            except IntegrityError as e:
                self.attempt_repo.db.rollback()
                if "UNIQUE constraint failed" not in str(e.orig):
                    raise
                if attempt_idx == 1:
                    raise ConflictError("CORRUPTED_LESSON_STATE")

    def _build_start_response(self, attempt: LessonAttempt, hearts: int, exercises: list) -> StartLessonResponse:
        return StartLessonResponse(
            attempt_id=attempt.id,
            current_exercise_index=attempt.current_exercise_index,
            hearts_remaining=hearts,
            exercises=[
                ExerciseResponse(
                    id=e.id,
                    type=e.type.value,
                    prompt=e.prompt,
                    data=e.data
                ) for e in exercises
            ]
        )
