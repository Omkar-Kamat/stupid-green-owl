import pytest
from datetime import datetime, timedelta, timezone
from app.models.domain import LessonAttempt, AttemptStatus, SkillProgress, ProgressStatus, Course, Unit, Skill, Lesson, Exercise, ExerciseType, User, UserStats, ExerciseAttempt

def _seed_exercise_attempts(db, attempt: LessonAttempt, lesson_id: int, count: int) -> None:
    exercises = (
        db.query(Exercise)
        .filter(Exercise.lesson_id == lesson_id)
        .order_by(Exercise.order_index.asc())
        .limit(count)
        .all()
    )
    for exercise in exercises:
        db.add(
            ExerciseAttempt(
                lesson_attempt_id=attempt.id,
                exercise_id=exercise.id,
                user_answer="A",
                is_correct=True,
            )
        )
    db.commit()

@pytest.fixture
def setup_completion_data(db):
    user = User(id=1, username="test_completion_user")
    stats = UserStats(
        user_id=1, 
        hearts=5, 
        total_xp=100, 
        current_streak=5, 
        longest_streak=5, 
        daily_xp=20, 
        last_activity_date=(datetime.now(timezone.utc) - timedelta(days=1)).date()
    )
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0, xp_reward_per_lesson=15, lessons_per_level=2)
    skill2 = Skill(id=2, unit_id=unit.id, title="Skill 2", icon="s", order_index=1, xp_reward_per_lesson=15, lessons_per_level=1)
    db.add_all([skill1, skill2])
    db.flush()
    
    prog1 = SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.available, crown_level=0, lessons_completed_in_level=1)
    db.add(prog1)
    db.flush()
    
    lesson1 = Lesson(id=1, skill_id=skill1.id, order_index=0)
    db.add(lesson1)
    db.flush()
    
    ex1 = Exercise(lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice, prompt="Q1", data={"options": ["A"]}, correct_answer="A")
    ex2 = Exercise(lesson_id=lesson1.id, order_index=1, type=ExerciseType.multiple_choice, prompt="Q2", data={"options": ["A"]}, correct_answer="A")
    db.add_all([ex1, ex2])
    db.commit()

def test_successful_completion_and_crown_cascade(client, db, setup_completion_data):
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200
    data = res.json()
    assert data["xp_awarded"] == 15
    assert data["total_xp"] == 115
    assert data["streak"] == 6
    assert data["crown_earned"] == True
    
    db.refresh(attempt)
    assert attempt.status == AttemptStatus.completed
    assert attempt.xp_awarded == 15
    assert attempt.completed_at is not None
    assert attempt.crown_earned is True
    
    stats = db.query(UserStats).filter_by(user_id=1).first()
    assert stats.total_xp == 115
    assert stats.daily_xp == 15 # Because last activity was yesterday, it resets to xp_reward
    assert stats.current_streak == 6
    assert stats.last_activity_date == datetime.now(timezone.utc).date()
    
    prog1 = db.query(SkillProgress).filter_by(user_id=1, skill_id=1).first()
    assert prog1.crown_level == 1
    assert prog1.lessons_completed_in_level == 0
    assert prog1.status == ProgressStatus.completed
    
    prog2 = db.query(SkillProgress).filter_by(user_id=1, skill_id=2).first()
    assert prog2 is not None
    assert prog2.status == ProgressStatus.available

def test_incomplete_lesson(client, db, setup_completion_data):
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=1)
    db.add(attempt)
    db.commit()
    
    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 409
    assert res.json()["detail"] == "LESSON_INCOMPLETE"

def test_failed_attempt(client, db, setup_completion_data):
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.failed, current_exercise_index=1)
    db.add(attempt)
    db.commit()
    
    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 409
    assert res.json()["detail"] == "ATTEMPT_ALREADY_TERMINATED"
    
    # Zero side effects check
    stats = db.query(UserStats).filter_by(user_id=1).first()
    assert stats.total_xp == 100

def test_idempotent_retry(client, db, setup_completion_data):
    attempt = LessonAttempt(
        user_id=1, lesson_id=1, status=AttemptStatus.completed, 
        current_exercise_index=2, xp_awarded=15, crown_earned=True
    )
    db.add(attempt)
    db.commit()
    
    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200
    data = res.json()
    assert data["xp_awarded"] == 15
    assert data["total_xp"] == 100 # Original stats
    assert data["crown_earned"] == True

def test_same_day_streak(client, db, setup_completion_data):
    stats = db.query(UserStats).filter_by(user_id=1).first()
    stats.last_activity_date = datetime.now(timezone.utc).date()
    stats.daily_xp = 50
    db.commit()
    
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200
    
    db.refresh(stats)
    assert stats.current_streak == 5 # No increment
    assert stats.daily_xp == 65 # 50 + 15

def test_broken_streak(client, db, setup_completion_data):
    stats = db.query(UserStats).filter_by(user_id=1).first()
    stats.last_activity_date = (datetime.now(timezone.utc) - timedelta(days=2)).date()
    db.commit()
    
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200
    
    db.refresh(stats)
    assert stats.current_streak == 1

def test_transaction_rollback(client, db, setup_completion_data, monkeypatch):
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    from app.services.progress_service import ProgressService
    def mock_handle_lesson_completed(*args, **kwargs):
        raise ValueError("Simulated failure")
        
    monkeypatch.setattr(ProgressService, "handle_lesson_completed", mock_handle_lesson_completed)
    
    with pytest.raises(ValueError, match="Simulated failure"):
        client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
        
    db.refresh(attempt)
    assert attempt.status == AttemptStatus.in_progress
    
    stats = db.query(UserStats).filter_by(user_id=1).first()
    assert stats.total_xp == 100
    
    progress = db.query(SkillProgress).filter_by(user_id=1, skill_id=1).first()
    assert progress.xp_earned == 0
    assert progress.lessons_completed_in_level == 1
    assert progress.crown_level == 0
    assert progress.status == ProgressStatus.available

def test_successful_completion_promotes_locked_progress(client, db, setup_completion_data):
    # Set skill 2 to explicitly locked in DB
    prog2_initial = SkillProgress(user_id=1, skill_id=2, status=ProgressStatus.locked)
    db.add(prog2_initial)
    db.commit()

    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200

    prog2 = db.query(SkillProgress).filter_by(user_id=1, skill_id=2).first()
    assert prog2 is not None
    assert prog2.status == ProgressStatus.available

def test_try_complete_attempt_is_exclusive(db, setup_completion_data):
    from datetime import datetime, timezone
    from app.repositories.attempt_repository import AttemptRepository

    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()

    repo = AttemptRepository(db)
    now = datetime.now(timezone.utc)
    assert repo.try_complete_attempt(attempt.id, 1, 15, now) is True
    assert repo.try_complete_attempt(attempt.id, 1, 15, now) is False


def test_double_complete_awards_xp_once(client, db, setup_completion_data):
    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=2)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=2)

    res1 = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    res2 = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")

    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["xp_awarded"] == res2.json()["xp_awarded"] == 15

    stats = db.query(UserStats).filter_by(user_id=1).first()
    db.refresh(stats)
    assert stats.total_xp == 115

def test_cross_unit_unlock_cascade(client, db):
    user = User(id=1, username="cross_unit_user")
    stats = UserStats(
        user_id=1,
        hearts=5,
        total_xp=100,
        current_streak=1,
        longest_streak=1,
        daily_xp=0,
        last_activity_date=(datetime.now(timezone.utc) - timedelta(days=1)).date(),
    )
    course = Course(id=1, name="Test", source_language="en", target_language="ja")
    db.add_all([user, stats, course])
    db.flush()

    unit1 = Unit(course_id=course.id, title="Unit 1", order_index=0, color_theme="purple")
    unit2 = Unit(course_id=course.id, title="Unit 2", order_index=1, color_theme="green")
    db.add_all([unit1, unit2])
    db.flush()

    skill1 = Skill(
        id=1, unit_id=unit1.id, title="Skill 1", icon="s", order_index=0,
        xp_reward_per_lesson=10, lessons_per_level=1,
    )
    skill2 = Skill(
        id=2, unit_id=unit2.id, title="Skill 2", icon="s", order_index=0,
        xp_reward_per_lesson=10, lessons_per_level=1,
    )
    db.add_all([skill1, skill2])
    db.flush()

    db.add(SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.available, lessons_completed_in_level=0))
    db.flush()

    lesson1 = Lesson(id=1, skill_id=skill1.id, order_index=0)
    db.add(lesson1)
    db.flush()
    db.add(Exercise(
        lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice,
        prompt="Q", data={"options": ["A"]}, correct_answer="A",
    ))
    db.commit()

    attempt = LessonAttempt(user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=1)
    db.add(attempt)
    db.commit()
    _seed_exercise_attempts(db, attempt, lesson_id=1, count=1)

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 200
    assert res.json()["crown_earned"] is True

    prog1 = db.query(SkillProgress).filter_by(user_id=1, skill_id=1).first()
    assert prog1.status == ProgressStatus.completed

    prog2 = db.query(SkillProgress).filter_by(user_id=1, skill_id=2).first()
    assert prog2 is not None
    assert prog2.status == ProgressStatus.available
