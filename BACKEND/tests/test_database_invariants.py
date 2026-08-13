import pytest
from sqlalchemy.exc import IntegrityError
from app.models.domain import User, Course, Unit, Skill, Lesson, LessonAttempt, AttemptStatus, SkillProgress, ProgressStatus

@pytest.fixture
def base_data(db):
    user = User(username="test_user")
    course = Course(name="Test", source_language="en", target_language="es")
    db.add_all([user, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Test", order_index=0, color_theme="red")
    db.add(unit)
    db.flush()
    skill = Skill(unit_id=unit.id, title="Skill", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.commit()
    return user, lesson, skill

def test_negative_current_exercise_index_rejected(db, base_data):
    user, lesson, skill = base_data
    attempt = LessonAttempt(
        user_id=user.id, lesson_id=lesson.id, status=AttemptStatus.in_progress,
        current_exercise_index=-1
    )
    db.add(attempt)
    with pytest.raises(IntegrityError):
        db.commit()

def test_negative_hearts_lost_rejected(db, base_data):
    user, lesson, skill = base_data
    attempt = LessonAttempt(
        user_id=user.id, lesson_id=lesson.id, status=AttemptStatus.in_progress,
        hearts_lost=-5
    )
    db.add(attempt)
    with pytest.raises(IntegrityError):
        db.commit()

def test_negative_xp_awarded_rejected(db, base_data):
    user, lesson, skill = base_data
    attempt = LessonAttempt(
        user_id=user.id, lesson_id=lesson.id, status=AttemptStatus.completed,
        xp_awarded=-10
    )
    db.add(attempt)
    with pytest.raises(IntegrityError):
        db.commit()

def test_negative_xp_earned_rejected(db, base_data):
    user, lesson, skill = base_data
    progress = SkillProgress(
        user_id=user.id, skill_id=skill.id, status=ProgressStatus.available,
        xp_earned=-1
    )
    db.add(progress)
    with pytest.raises(IntegrityError):
        db.commit()
