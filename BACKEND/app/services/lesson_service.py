from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.attempt_repository import AttemptRepository
from app.repositories.user_repository import UserStatsRepository
from app.schemas.path import PathResponse, UnitResponse, SkillPathResponse
from app.schemas.lesson import StartLessonResponse, ExerciseResponse, AnswerRequest, AnswerResponse, CompleteResponse
from app.services.evaluators import EVALUATORS
from datetime import datetime, timezone
import time
from app.models.domain import LessonAttempt, AttemptStatus, ExerciseAttempt
from app.core.config import settings
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError
from app.core.db_errors import is_unique_violation
from sqlalchemy.exc import IntegrityError
from app.services.gamification_service import GamificationService
from app.services.progress_service import ProgressService

class LessonService:
    def __init__(
        self, 
        lesson_repo: LessonRepository, 
        progress_repo: ProgressRepository,
        attempt_repo: AttemptRepository,
        user_stats_repo: UserStatsRepository,
        gamification_service: GamificationService,
        progress_service: ProgressService
    ):
        self.lesson_repo = lesson_repo
        self.progress_repo = progress_repo
        self.attempt_repo = attempt_repo
        self.user_stats_repo = user_stats_repo
        self.gamification_service = gamification_service
        self.progress_service = progress_service

    def _resolve_skill_status(self, user_id: int, skill_id: int) -> str:
        progress = self.progress_repo.get_skill_progress(user_id, skill_id)
        if progress:
            return progress.status.value

        first_skill = self.lesson_repo.get_first_skill_in_course(settings.DEFAULT_COURSE_ID)
        if first_skill and first_skill.id == skill_id:
            return "available"
        return "locked"

    def get_path(self, user_id: int) -> PathResponse:
        units = self.lesson_repo.get_course_tree(course_id=settings.DEFAULT_COURSE_ID)
        user_progress = self.progress_repo.get_user_progress(user_id)
        
        unit_responses = []
        is_first_skill_overall = True
        all_skill_ids = [
            skill.id
            for unit in units
            for skill in sorted(unit.skills, key=lambda s: s.order_index)
        ]
        primary_lesson_ids = self.lesson_repo.get_primary_lesson_ids_for_skills(all_skill_ids)

        for unit in units:
            sorted_skills = sorted(unit.skills, key=lambda s: s.order_index)
            skill_responses = []
            
            for skill in sorted_skills:
                progress = user_progress.get(skill.id)
                crown_level = progress.crown_level if progress else 0
                
                if progress:
                    status = progress.status.value
                    is_first_skill_overall = False
                elif is_first_skill_overall:
                    status = "available"
                    is_first_skill_overall = False
                else:
                    status = "locked"

                lesson_id = primary_lesson_ids.get(skill.id)
                if lesson_id is None:
                    raise ConflictError("CORRUPTED_LESSON_STATE")
                
                skill_responses.append(
                    SkillPathResponse(
                        id=skill.id,
                        title=skill.title,
                        icon=skill.icon,
                        status=status,
                        crown_level=crown_level,
                        lesson_id=lesson_id,
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

        skill_status = self._resolve_skill_status(user_id, lesson.skill_id)
        if skill_status == "locked":
            raise ForbiddenError("SKILL_LOCKED")
            
        stats = self.user_stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise ConflictError("CORRUPTED_USER_STATS")

        if self.gamification_service.regenerate_hearts(stats):
            try:
                self.user_stats_repo.db.commit()
            except Exception:
                self.user_stats_repo.db.rollback()
                raise

        hearts_remaining = stats.hearts
        
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
                if not is_unique_violation(e):
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

    def submit_answer(self, user_id: int, attempt_id: int, req: AnswerRequest) -> AnswerResponse:
        attempt = self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundError("ATTEMPT", attempt_id)
            
        if attempt.user_id != user_id:
            raise ForbiddenError("ATTEMPT_FORBIDDEN")
            
        if attempt.status != AttemptStatus.in_progress:
            raise ConflictError("ATTEMPT_ALREADY_TERMINATED")
            
        lesson = self.lesson_repo.get_lesson_with_exercises(attempt.lesson_id)
        if not lesson:
            raise ConflictError("CORRUPTED_LESSON_STATE")
            
        exercise = next((e for e in lesson.exercises if e.id == req.exercise_id), None)
        if not exercise:
            raise ConflictError("EXERCISE_NOT_IN_LESSON")
            
        if exercise.order_index != attempt.current_exercise_index:
            raise ConflictError("EXERCISE_NOT_CURRENT")
            
        evaluator = EVALUATORS.get(exercise.type)
        if not evaluator:
            raise ConflictError("UNSUPPORTED_EXERCISE_TYPE")
            
        stats = self.user_stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise ConflictError("CORRUPTED_USER_STATS")
            
        is_correct = evaluator.evaluate(exercise, req.answer)
        
        ex_attempt = ExerciseAttempt(
            lesson_attempt_id=attempt.id,
            exercise_id=exercise.id,
            user_answer=req.answer,
            is_correct=is_correct
        )
        
        lesson_failed = False
        
        try:
            self.attempt_repo.create_exercise_attempt(ex_attempt)
            
            if is_correct:
                attempt.current_exercise_index += 1
            else:
                attempt.hearts_lost += 1
                self.gamification_service.consume_heart(stats)
                
                if stats.hearts == 0:
                    attempt.status = AttemptStatus.failed
                    attempt.completed_at = datetime.now(timezone.utc)
                    lesson_failed = True
                    
            self.attempt_repo.db.commit()
        except IntegrityError as e:
            self.attempt_repo.db.rollback()
            if not is_unique_violation(e):
                raise
            raise ConflictError("EXERCISE_ALREADY_ANSWERED")
        except Exception:
            self.attempt_repo.db.rollback()
            raise
        
        return AnswerResponse(
            correct=is_correct,
            correct_answer=exercise.correct_answer,
            hearts_remaining=stats.hearts,
            next_exercise_index=attempt.current_exercise_index,
            lesson_failed=lesson_failed
        )

    def complete_lesson(self, user_id: int, attempt_id: int) -> CompleteResponse:
        attempt = self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundError("ATTEMPT", attempt_id)

        if attempt.user_id != user_id:
            raise ForbiddenError("ATTEMPT_FORBIDDEN")

        if attempt.status == AttemptStatus.failed:
            raise ConflictError("ATTEMPT_ALREADY_TERMINATED")

        stats = self.user_stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise ConflictError("CORRUPTED_USER_STATS")

        if attempt.status == AttemptStatus.completed:
            if attempt.xp_awarded is not None:
                return CompleteResponse(
                    xp_awarded=attempt.xp_awarded,
                    total_xp=stats.total_xp,
                    streak=stats.current_streak,
                    crown_earned=bool(attempt.crown_earned),
                )
            raise ConflictError("ATTEMPT_ALREADY_TERMINATED")

        lesson = self.lesson_repo.get_lesson_with_exercises(attempt.lesson_id)
        if not lesson:
            raise ConflictError("CORRUPTED_LESSON_STATE")

        if attempt.current_exercise_index < len(lesson.exercises):
            raise ConflictError("LESSON_INCOMPLETE")

        if attempt.current_exercise_index > len(lesson.exercises):
            raise ConflictError("CORRUPTED_LESSON_STATE")

        answered_count = self.attempt_repo.count_exercise_attempts(attempt_id)
        if answered_count < len(lesson.exercises):
            raise ConflictError("LESSON_INCOMPLETE")

        skill = self.lesson_repo.get_skill(lesson.skill_id)
        if not skill:
            raise ConflictError("CORRUPTED_LESSON_STATE")

        xp_reward = skill.xp_reward_per_lesson
        completed_at = datetime.now(timezone.utc)

        if not self.attempt_repo.try_complete_attempt(
            attempt_id, user_id, xp_reward, completed_at
        ):
            self.attempt_repo.db.rollback()
            return self._wait_for_completed_attempt(user_id, attempt_id)

        attempt = self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise ConflictError("CORRUPTED_LESSON_STATE")

        try:
            self.gamification_service.handle_lesson_completed(stats, xp_reward)
            crown_earned = self.progress_service.handle_lesson_completed(user_id, skill, xp_reward)
            attempt.crown_earned = crown_earned

            self.attempt_repo.db.commit()

            return CompleteResponse(
                xp_awarded=xp_reward,
                total_xp=stats.total_xp,
                streak=stats.current_streak,
                crown_earned=crown_earned,
            )
        except IntegrityError as exc:
            self.attempt_repo.db.rollback()
            if is_unique_violation(exc):
                attempt = self.attempt_repo.get_attempt_by_id(attempt_id)
                stats = self.user_stats_repo.get_stats_by_user_id(user_id)
                if (
                    attempt
                    and attempt.status == AttemptStatus.completed
                    and attempt.xp_awarded is not None
                    and stats
                ):
                    return CompleteResponse(
                        xp_awarded=attempt.xp_awarded,
                        total_xp=stats.total_xp,
                        streak=stats.current_streak,
                        crown_earned=bool(attempt.crown_earned),
                    )
            raise
        except Exception:
            self.attempt_repo.db.rollback()
            raise

    def _wait_for_completed_attempt(self, user_id: int, attempt_id: int) -> CompleteResponse:
        for _ in range(50):
            attempt = self.attempt_repo.get_attempt_by_id(attempt_id)
            stats = self.user_stats_repo.get_stats_by_user_id(user_id)
            if (
                attempt
                and attempt.status == AttemptStatus.completed
                and attempt.xp_awarded is not None
                and stats
            ):
                return CompleteResponse(
                    xp_awarded=attempt.xp_awarded,
                    total_xp=stats.total_xp,
                    streak=stats.current_streak,
                    crown_earned=bool(attempt.crown_earned),
                )
            time.sleep(0.002)
        raise ConflictError("ATTEMPT_ALREADY_TERMINATED")
