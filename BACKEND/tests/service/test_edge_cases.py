import pytest
from app.services.lesson_service import LessonService
from app.services.progress_service import ProgressService
from app.services.gamification_service import GamificationService
from app.models.domain import LessonAttempt, AttemptStatus, Skill, UserStats
from app.core.exceptions import ConflictError, NotFoundError, ForbiddenError
from datetime import datetime, timezone

def test_progress_service_new_skill(db):
    from app.repositories.progress_repository import ProgressRepository
    from app.repositories.lesson_repository import LessonRepository
    
    prog_repo = ProgressRepository(db)
    less_repo = LessonRepository(db)
    svc = ProgressService(prog_repo, less_repo)
    
    from app.models.domain import Unit
    unit = Unit(id=999, course_id=1, title="Test Unit", order_index=1, color_theme="blue")
    db.add(unit)
    db.commit()
    
    # Fake skill
    skill = Skill(id=999, unit_id=999, title="Test", icon="star", order_index=1, lessons_per_level=1, xp_reward_per_lesson=10)
    db.add(skill)
    db.commit()
    
    # User 1 has no progress on 999. Handle completion.
    crown = svc.handle_lesson_completed(1, skill, 10)
    assert crown is True
    
    prog = prog_repo.get_skill_progress(1, 999)
    assert prog is not None
    assert prog.crown_level == 1
    assert prog.xp_earned == 10

def test_gamification_service_first_streak():
    svc = GamificationService()
    stats = UserStats(user_id=99, hearts=5, max_hearts=5, current_streak=0, longest_streak=0, total_xp=0, daily_xp=0)
    
    # last_activity_date is None
    svc.handle_lesson_completed(stats, 15)
    
    assert stats.current_streak == 1
    assert stats.longest_streak == 1
    assert stats.daily_xp == 15

def test_lesson_service_complete_validation(db):
    from app.repositories.lesson_repository import LessonRepository
    from app.repositories.progress_repository import ProgressRepository
    from app.repositories.attempt_repository import AttemptRepository
    from app.repositories.user_repository import UserStatsRepository
    
    svc = LessonService(
        LessonRepository(db),
        ProgressRepository(db),
        AttemptRepository(db),
        UserStatsRepository(db),
        GamificationService(),
        ProgressService(ProgressRepository(db), LessonRepository(db))
    )
    
    with pytest.raises(NotFoundError):
        svc.complete_lesson(1, 9999)
        
    # Create fake attempt and stats
    stats = UserStats(user_id=2, hearts=5, max_hearts=5, total_xp=0, gems=0, daily_goal=10, current_streak=0, longest_streak=0, daily_xp=0)
    db.add(stats)
    attempt = LessonAttempt(user_id=2, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=0, hearts_lost=0)
    db.add(attempt)
    db.commit()
    
    with pytest.raises(ForbiddenError):
        svc.complete_lesson(1, attempt.id)
        
    attempt.status = AttemptStatus.completed
    db.commit()
    
    with pytest.raises(ConflictError, match="ATTEMPT_ALREADY_TERMINATED"):
        svc.complete_lesson(2, attempt.id)
