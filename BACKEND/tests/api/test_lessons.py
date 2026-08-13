import pytest
from app.models.domain import LessonAttempt, AttemptStatus, SkillProgress, ProgressStatus, Course, Unit, Skill, Lesson, Exercise, ExerciseType, User, UserStats

@pytest.fixture
def setup_data(db):
    user = User(id=1, username="test_user")
    stats = UserStats(user_id=1, hearts=5)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    skill2 = Skill(id=2, unit_id=unit.id, title="Skill 2", icon="s", order_index=1)
    db.add_all([skill1, skill2])
    db.flush()
    
    prog = SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.available)
    db.add(prog)
    
    lesson1 = Lesson(id=1, skill_id=skill1.id, order_index=0)
    lesson2 = Lesson(id=2, skill_id=skill2.id, order_index=0)
    db.add_all([lesson1, lesson2])
    db.flush()
    
    ex1 = Exercise(lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice, prompt="Q1", data={"options": ["A", "B"]}, correct_answer="A")
    ex2 = Exercise(lesson_id=lesson1.id, order_index=1, type=ExerciseType.translate, prompt="Q2", data={"options": ["A", "B"]}, correct_answer="A")
    ex3 = Exercise(lesson_id=lesson1.id, order_index=2, type=ExerciseType.type_answer, prompt="Q3", data={"options": ["A", "B"]}, correct_answer="A")
    ex4 = Exercise(lesson_id=lesson2.id, order_index=0, type=ExerciseType.type_answer, prompt="Q4", data={"options": ["A", "B"]}, correct_answer="A")
    
    db.add_all([ex1, ex2, ex3, ex4])
    db.commit()

def test_start_lesson_new_attempt(client, db, setup_data):
    response = client.post("/api/v1/lessons/1/start")
    assert response.status_code == 200
    data = response.json()
    assert "attempt_id" in data
    assert data["current_exercise_index"] == 0
    assert data["hearts_remaining"] == 5
    assert len(data["exercises"]) == 3
    assert "correct_answer" not in data["exercises"][0]
    assert data["exercises"][0]["prompt"] == "Q1"
    assert data["exercises"][1]["prompt"] == "Q2"
    assert data["exercises"][2]["prompt"] == "Q3"
    
    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == data["attempt_id"]).first()
    assert attempt is not None
    assert attempt.status.value == "in_progress"
    assert attempt.current_exercise_index == 0
    assert attempt.hearts_lost == 0

def test_start_lesson_resume_active(client, db, setup_data):
    res1 = client.post("/api/v1/lessons/1/start")
    assert res1.status_code == 200
    attempt_id = res1.json()["attempt_id"]

    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id).first()
    attempt.current_exercise_index = 3
    attempt.hearts_lost = 1
    original_started_at = attempt.started_at
    db.commit()

    res2 = client.post("/api/v1/lessons/1/start")
    assert res2.status_code == 200
    res2_json = res2.json()
    assert res2_json["attempt_id"] == attempt_id
    assert res2_json["current_exercise_index"] == 3
    
    db.refresh(attempt)
    assert attempt.hearts_lost == 1
    assert attempt.started_at == original_started_at

def test_start_locked_lesson(client, db, setup_data):
    res = client.post("/api/v1/lessons/2/start")
    assert res.status_code == 403
    assert res.json()["detail"] == "SKILL_LOCKED"

def test_start_completed_creates_new(client, db, setup_data):
    res1 = client.post("/api/v1/lessons/1/start")
    attempt_id = res1.json()["attempt_id"]
    
    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id).first()
    attempt.status = AttemptStatus.completed
    db.commit()
    
    res2 = client.post("/api/v1/lessons/1/start")
    assert res2.status_code == 200
    new_attempt_id = res2.json()["attempt_id"]
    assert new_attempt_id != attempt_id

def test_start_failed_creates_new(client, db, setup_data):
    res1 = client.post("/api/v1/lessons/1/start")
    attempt_id = res1.json()["attempt_id"]
    
    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id).first()
    attempt.status = AttemptStatus.failed
    db.commit()
    
    res2 = client.post("/api/v1/lessons/1/start")
    assert res2.status_code == 200
    new_attempt_id = res2.json()["attempt_id"]
    assert new_attempt_id != attempt_id

def test_start_nonexistent_lesson(client, db, setup_data):
    res = client.post("/api/v1/lessons/999/start")
    assert res.status_code == 404
    assert res.json()["detail"] == "LESSON_NOT_FOUND"

def test_lesson_no_exercises(client, db, setup_data):
    empty_lesson = Lesson(id=3, skill_id=1, order_index=99)
    db.add(empty_lesson)
    db.commit()
    
    res = client.post(f"/api/v1/lessons/{empty_lesson.id}/start")
    assert res.status_code == 409
    assert res.json()["detail"] == "LESSON_HAS_NO_EXERCISES"

def test_start_lesson_missing_stats(client, db, setup_data):
    user2 = User(id=2, username="no_stats_user")
    db.add(user2)
    db.commit()
    
    from app.api.deps import get_current_user
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: 2
    try:
        res = client.post("/api/v1/lessons/1/start")
        assert res.status_code == 409
        assert res.json()["detail"] == "CORRUPTED_USER_STATS"
    finally:
        if get_current_user in app.dependency_overrides:
            del app.dependency_overrides[get_current_user]
