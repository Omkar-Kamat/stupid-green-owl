import pytest
from app.models.domain import LessonAttempt, AttemptStatus, UserStats, ExerciseAttempt, Course, Unit, Skill, Lesson, Exercise, ExerciseType, User
from sqlalchemy.orm import Session

@pytest.fixture
def setup_data(db: Session):
    user = User(id=1, username="test_user")
    stats = UserStats(user_id=1, hearts=5)
    
    user2 = User(id=2, username="test_user2")
    stats2 = UserStats(user_id=2, hearts=5)
    
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, user2, stats2, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill1)
    db.flush()
    lesson1 = Lesson(id=1, skill_id=skill1.id, order_index=0)
    lesson2 = Lesson(id=2, skill_id=skill1.id, order_index=1)
    db.add_all([lesson1, lesson2])
    db.flush()
    
    ex1 = Exercise(id=1, lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice, prompt="Q1", data={"options": ["A", "B"]}, correct_answer="A")
    ex2 = Exercise(id=2, lesson_id=lesson1.id, order_index=1, type=ExerciseType.translate, prompt="Q2", data={"word_bank": ["C", "D"]}, correct_answer=["C"])
    ex3 = Exercise(id=3, lesson_id=lesson1.id, order_index=2, type=ExerciseType.type_answer, prompt="Q3", data={"placeholder": ""}, correct_answer=["E", "F"])
    
    ex4 = Exercise(id=4, lesson_id=lesson2.id, order_index=0, type=ExerciseType.multiple_choice, prompt="Q4", data={}, correct_answer="X")
    
    db.add_all([ex1, ex2, ex3, ex4])
    
    attempt = LessonAttempt(
        id=1, user_id=1, lesson_id=lesson1.id, status=AttemptStatus.in_progress,
        current_exercise_index=0, hearts_lost=0
    )
    db.add(attempt)
    db.commit()

def test_correct_answer(client, db, setup_data):
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 200
    data = res.json()
    assert data["correct"] is True
    assert data["correct_answer"] == "A"
    assert data["hearts_remaining"] == 5
    assert data["next_exercise_index"] == 1
    assert data["lesson_failed"] is False
    
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    assert attempt.current_exercise_index == 1
    assert attempt.hearts_lost == 0
    
    ex_attempt = db.query(ExerciseAttempt).filter_by(lesson_attempt_id=1).first()
    assert ex_attempt is not None
    assert ex_attempt.exercise_id == 1
    assert ex_attempt.user_answer == "A"
    assert ex_attempt.is_correct is True

def test_incorrect_answer(client, db, setup_data):
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "B"})
    assert res.status_code == 200
    data = res.json()
    assert data["correct"] is False
    assert data["correct_answer"] == "A"
    assert data["hearts_remaining"] == 4
    assert data["next_exercise_index"] == 0
    assert data["lesson_failed"] is False
    
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    assert attempt.current_exercise_index == 0
    assert attempt.hearts_lost == 1
    
    stats = db.query(UserStats).filter_by(user_id=1).first()
    assert stats.hearts == 4
    assert stats.last_heart_lost_at is not None

def test_incorrect_answer_exhausting_hearts(client, db, setup_data):
    stats = db.query(UserStats).filter_by(user_id=1).first()
    stats.hearts = 1
    db.commit()
    
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "B"})
    assert res.status_code == 200
    data = res.json()
    assert data["correct"] is False
    assert data["hearts_remaining"] == 0
    assert data["lesson_failed"] is True
    
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    assert attempt.status == AttemptStatus.failed
    assert attempt.completed_at is not None
    assert attempt.current_exercise_index == 0

def test_correct_answer_final_exercise(client, db, setup_data):
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    attempt.current_exercise_index = 2
    db.commit()
    
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 3, "answer": "E"})
    assert res.status_code == 200
    data = res.json()
    assert data["next_exercise_index"] == 3
    
    db.refresh(attempt)
    assert attempt.current_exercise_index == 3
    assert attempt.status == AttemptStatus.in_progress  # Feature 3C handles completion

def test_attempt_not_found(client, db, setup_data):
    res = client.post("/api/v1/lesson-attempts/999/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 404

def test_attempt_forbidden(client, db, setup_data):
    # Setup data makes attempt 1 belong to user 1. We mock the dependency to return user 2
    from app.api.deps import get_current_user
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: 2
    try:
        res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "A"})
        assert res.status_code == 403
    finally:
        del app.dependency_overrides[get_current_user]

def test_completed_attempt(client, db, setup_data):
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    attempt.status = AttemptStatus.completed
    db.commit()
    
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 409
    assert res.json()["detail"] == "ATTEMPT_ALREADY_TERMINATED"

def test_exercise_from_another_lesson(client, db, setup_data):
    # exercise 4 belongs to lesson 2
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 4, "answer": "X"})
    assert res.status_code == 409
    assert res.json()["detail"] == "EXERCISE_NOT_IN_LESSON"

def test_future_exercise(client, db, setup_data):
    # attempt is at index 0
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 2, "answer": ["C"]})
    assert res.status_code == 409
    assert res.json()["detail"] == "EXERCISE_NOT_CURRENT"

def test_malformed_payload_missing_field(client, db, setup_data):
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"answer": "A"}) # missing exercise_id
    assert res.status_code == 422

def test_malformed_shape_422(client, db, setup_data):
    # Exercise 1 is multiple_choice, expects string answer
    res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": ["wrong type"]})
    assert res.status_code == 422
    assert res.json()["detail"] == "INVALID_ANSWER_PAYLOAD"

def test_submit_answer_transaction_rollback(client, db, setup_data):
    from unittest.mock import patch
    from sqlalchemy.exc import SQLAlchemyError
    
    with patch('sqlalchemy.orm.Session.commit', side_effect=SQLAlchemyError("mock db error")):
        try:
            res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "B"})
            assert res.status_code == 500
        except SQLAlchemyError:
            pass # FastAPI test client might raise it directly

    db.rollback()
    
    attempt = db.query(LessonAttempt).filter_by(id=1).first()
    assert attempt.hearts_lost == 0
    assert attempt.status == AttemptStatus.in_progress
    
    stats = db.query(UserStats).filter_by(user_id=1).first()
    assert stats.hearts == 5
    
    ex_attempt = db.query(ExerciseAttempt).filter_by(lesson_attempt_id=1).first()
    assert ex_attempt is None

def test_concurrent_correct_answer_409(client, db, setup_data):
    from unittest.mock import patch
    from sqlalchemy.exc import IntegrityError
    
    # Mock flush to simulate the partial unique constraint failing (as if a concurrent request just inserted it)
    class MockOrig:
        def __str__(self):
            return "UNIQUE constraint failed"
            
    with patch('sqlalchemy.orm.Session.flush', side_effect=IntegrityError("mock", "mock", MockOrig())):
        res = client.post("/api/v1/lesson-attempts/1/answers", json={"exercise_id": 1, "answer": "A"})
        assert res.status_code == 409
        assert res.json()["detail"] == "EXERCISE_ALREADY_ANSWERED"
