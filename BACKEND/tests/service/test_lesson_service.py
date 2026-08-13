import pytest
from app.models.domain import Course, Unit, Skill, SkillProgress, ProgressStatus
from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.lesson_service import LessonService

def setup_course(db):
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill1 = Skill(unit_id=unit.id, title="Skill 1", icon="s1", order_index=0)
    skill2 = Skill(unit_id=unit.id, title="Skill 2", icon="s2", order_index=1)
    skill3 = Skill(unit_id=unit.id, title="Skill 3", icon="s3", order_index=2)
    db.add_all([skill1, skill2, skill3])
    db.commit()
    return skill1, skill2, skill3

def test_get_path_no_progress(db):
    skill1, skill2, skill3 = setup_course(db)
    
    lesson_repo = LessonRepository(db)
    prog_repo = ProgressRepository(db)
    service = LessonService(lesson_repo, prog_repo)
    
    path = service.get_path(user_id=1)
    
    skills = path.units[0].skills
    assert skills[0].status == "available"
    assert skills[1].status == "locked"
    assert skills[2].status == "locked"

def test_get_path_with_progress(db):
    skill1, skill2, skill3 = setup_course(db)
    db.add(SkillProgress(user_id=1, skill_id=skill1.id, status=ProgressStatus.completed))
    db.commit()

    lesson_repo = LessonRepository(db)
    prog_repo = ProgressRepository(db)
    service = LessonService(lesson_repo, prog_repo)
    
    path = service.get_path(user_id=1)
    
    skills = path.units[0].skills
    assert skills[0].status == "completed"
    assert skills[1].status == "available"
    assert skills[2].status == "locked"
