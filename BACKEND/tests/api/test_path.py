from app.models.domain import Course, Unit, Skill, SkillProgress, ProgressStatus

def test_read_learning_path(client, db):
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(unit_id=unit.id, title="Skill 1", icon="hand", order_index=0)
    skill2 = Skill(unit_id=unit.id, title="Skill 2", icon="hand", order_index=1)
    db.add_all([skill1, skill2])
    db.flush()
    progress = SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.completed)
    db.add(progress)
    db.commit()

    response = client.get("/api/v1/path")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["units"]) == 1
    assert data["units"][0]["title"] == "Basics"
    skills = data["units"][0]["skills"]
    assert skills[0]["status"] == "completed"
    assert skills[1]["status"] == "available"
