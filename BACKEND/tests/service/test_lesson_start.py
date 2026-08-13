import pytest
from app.services.lesson_service import LessonService
from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.attempt_repository import AttemptRepository
from app.repositories.user_repository import UserStatsRepository
from sqlalchemy.exc import IntegrityError
from app.models.domain import LessonAttempt, AttemptStatus, Course, Unit, Skill, Lesson, Exercise, ExerciseType, User, UserStats, SkillProgress, ProgressStatus

@pytest.fixture
def setup_service_data(db):
    user = User(id=1, username="test_user")
    stats = UserStats(user_id=1, hearts=5)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill1)
    db.flush()
    
    prog = SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.available)
    db.add(prog)
    
    lesson1 = Lesson(id=1, skill_id=skill1.id, order_index=0)
    db.add(lesson1)
    db.flush()
    
    ex1 = Exercise(lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice, prompt="Q1", data={"options": ["A", "B"]}, correct_answer="A")
    db.add(ex1)
    db.commit()

def test_concurrency_recovery(db, setup_service_data):
    lesson_repo = LessonRepository(db)
    progress_repo = ProgressRepository(db)
    attempt_repo = AttemptRepository(db)
    user_stats_repo = UserStatsRepository(db)
    
    service = LessonService(lesson_repo, progress_repo, attempt_repo, user_stats_repo)
    
    create_calls = 0
    original_create = attempt_repo.create_attempt
    def fake_create(attempt):
        nonlocal create_calls
        create_calls += 1
        if create_calls == 1:
            class MockOrig:
                def __str__(self):
                    return "UNIQUE constraint failed: lesson_attempts.user_id, lesson_attempts.lesson_id"
            
            exc = IntegrityError("mock", "mock", MockOrig())
            raise exc
        else:
            return original_create(attempt)
            
    attempt_repo.create_attempt = fake_create
    
    get_calls = 0
    dummy_attempt = LessonAttempt(id=999, user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=0, hearts_lost=0)
    
    def fake_get(user_id, lesson_id):
        nonlocal get_calls
        get_calls += 1
        if get_calls == 1:
            return None
        return dummy_attempt
        
    attempt_repo.get_active_attempt = fake_get
    
    # Should catch IntegrityError, rollback, call get_active_attempt again and return dummy_attempt
    res = service.start_lesson(1, 1)
    
    assert res.attempt_id == 999
    assert create_calls == 1
    assert get_calls == 2
