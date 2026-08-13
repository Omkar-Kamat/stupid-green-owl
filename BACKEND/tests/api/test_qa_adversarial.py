import pytest
from app.models.domain import Course, Unit, Skill, SkillProgress, ProgressStatus, User, UserStats

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
