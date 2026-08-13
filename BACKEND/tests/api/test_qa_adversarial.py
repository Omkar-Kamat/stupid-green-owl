import pytest
from app.models.domain import Course, Unit, Skill, SkillProgress, ProgressStatus, User, UserStats, Lesson, Exercise, ExerciseType, LessonAttempt, AttemptStatus

def test_path_with_no_courses_returns_empty_units(client, db):
    # db is empty
    response = client.get("/api/v1/path")
    assert response.status_code == 200
    assert response.json()["units"] == []

def test_path_strictly_respects_database_status_overriding_logical_order(client, db):
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    # First skill
    skill1 = Skill(unit_id=unit.id, title="Skill 1", icon="hand", order_index=0)
    # Second skill
    skill2 = Skill(unit_id=unit.id, title="Skill 2", icon="hand", order_index=1)
    db.add_all([skill1, skill2])
    db.flush()
    
    # Adversarial DB state: skill 1 completed, but skill 2 is explicitly locked.
    # The API should strictly return locked for skill 2, proving it doesn't derive available automatically.
    progress1 = SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.completed)
    progress2 = SkillProgress(user_id=1, skill_id=skill2.id, status=ProgressStatus.locked)
    db.add_all([progress1, progress2])
    db.commit()

    response = client.get("/api/v1/path")
    assert response.status_code == 200
    
    skills = response.json()["units"][0]["skills"]
    assert skills[0]["status"] == "completed"
    assert skills[1]["status"] == "locked" # Proven DB source of truth

def test_user_stats_missing_returns_404(client, db):
    # User exists, but stats missing
    user = User(id=1, username="demo_learner")
    db.add(user)
    db.commit()

    response = client.get("/api/v1/me/stats")
    assert response.status_code == 404
    assert response.json()["detail"] == "USER_STATS_NOT_FOUND"

def test_path_multiple_courses_fetches_specifically_course_one(client, db):
    course1 = Course(id=1, name="Spanish", source_language="en", target_language="es")
    course2 = Course(id=2, name="French", source_language="en", target_language="fr")
    db.add_all([course1, course2])
    db.flush()
    
    unit_fr = Unit(course_id=course2.id, title="French Basics", order_index=0, color_theme="blue")
    db.add(unit_fr)
    db.commit()

    # Even though course 2 has a unit, course 1 is empty. 
    # API should return empty because it explicitly targets course 1.
    response = client.get("/api/v1/path")
    assert response.status_code == 200
    assert response.json()["units"] == []

@pytest.fixture
def qa_setup_data(db):
    course = Course(id=1, name="QA Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    ex1 = Exercise(id=1, lesson_id=lesson.id, order_index=0, type="multiple_choice", prompt="Q1", data={}, correct_answer="A")
    ex2 = Exercise(id=2, lesson_id=lesson.id, order_index=1, type="multiple_choice", prompt="Q2", data={}, correct_answer="B")
    db.add_all([ex1, ex2])
    db.flush()
    
    user = User(id=1, username="qa_user")
    stats = UserStats(user_id=1, hearts=5)
    db.add_all([user, stats])
    db.commit()

def test_answer_past_exercise_returns_409(client, db, qa_setup_data):
    # Attempt has already progressed past exercise 0
    from app.models.domain import LessonAttempt, AttemptStatus
    attempt = LessonAttempt(id=100, user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=1, hearts_lost=0)
    db.add(attempt)
    db.commit()

    res = client.post("/api/v1/lesson-attempts/100/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 409
    assert res.json()["detail"] == "EXERCISE_NOT_CURRENT"

def test_answer_failed_attempt_returns_409(client, db, qa_setup_data):
    from app.models.domain import LessonAttempt, AttemptStatus
    attempt = LessonAttempt(id=101, user_id=1, lesson_id=1, status=AttemptStatus.failed, current_exercise_index=0, hearts_lost=5)
    db.add(attempt)
    db.commit()

    res = client.post("/api/v1/lesson-attempts/101/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 409
    assert res.json()["detail"] == "ATTEMPT_ALREADY_TERMINATED"

def test_answer_correct_when_hearts_zero(client, db, qa_setup_data):
    from app.models.domain import LessonAttempt, AttemptStatus
    attempt = LessonAttempt(id=102, user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=0, hearts_lost=5)
    db.add(attempt)
    stats = db.query(UserStats).filter_by(user_id=1).first()
    stats.hearts = 0
    db.commit()

    # User submits correct answer despite having 0 hearts globally
    res = client.post("/api/v1/lesson-attempts/102/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 200
    assert res.json()["correct"] is True
    assert res.json()["hearts_remaining"] == 0
    assert res.json()["next_exercise_index"] == 1
    assert res.json()["lesson_failed"] is False

def test_answer_incorrect_when_hearts_zero(client, db, qa_setup_data):
    from app.models.domain import LessonAttempt, AttemptStatus
    attempt = LessonAttempt(id=103, user_id=1, lesson_id=1, status=AttemptStatus.in_progress, current_exercise_index=0, hearts_lost=5)
    db.add(attempt)
    stats = db.query(UserStats).filter_by(user_id=1).first()
    stats.hearts = 0
    db.commit()

    res = client.post("/api/v1/lesson-attempts/103/answers", json={"exercise_id": 1, "answer": "WRONG"})
    assert res.status_code == 200
    assert res.json()["correct"] is False
    assert res.json()["hearts_remaining"] == 0
    assert res.json()["lesson_failed"] is True
    
    db.refresh(attempt)
    assert attempt.status == AttemptStatus.failed

def test_answer_after_completion_returns_409(client, db, qa_setup_data):
    from app.models.domain import LessonAttempt, AttemptStatus
    attempt = LessonAttempt(id=104, user_id=1, lesson_id=1, status=AttemptStatus.completed, current_exercise_index=2, hearts_lost=0)
    db.add(attempt)
    db.commit()

    res = client.post("/api/v1/lesson-attempts/104/answers", json={"exercise_id": 1, "answer": "A"})
    assert res.status_code == 409
    assert res.json()["detail"] == "ATTEMPT_ALREADY_TERMINATED"

def test_start_locked_skill_returns_403(client, db, qa_setup_data):
    from app.models.domain import SkillProgress, ProgressStatus
    # Set skill 1 to locked explicitly
    prog = SkillProgress(user_id=1, skill_id=1, status=ProgressStatus.locked)
    db.add(prog)
    db.commit()

    # user tries to start lesson 1 (which belongs to skill 1)
    res = client.post("/api/v1/lessons/1/start")
    assert res.status_code == 403
    assert res.json()["detail"] == "SKILL_LOCKED"
