from sqlalchemy.orm import Session, selectinload
from app.models.domain import Course, Unit, Lesson, Skill
from app.core.config import settings

class LessonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_course_tree(self, course_id: int = settings.DEFAULT_COURSE_ID) -> list[Unit]:
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return []
        
        return (
            self.db.query(Unit)
            .filter(Unit.course_id == course.id)
            .options(selectinload(Unit.skills))
            .order_by(Unit.order_index)
            .all()
        )

    def get_lesson_with_exercises(self, lesson_id: int) -> Lesson | None:
        lesson = (
            self.db.query(Lesson)
            .filter(Lesson.id == lesson_id)
            .options(selectinload(Lesson.exercises))
            .first()
        )
        if lesson:
            lesson.exercises.sort(key=lambda e: e.order_index)
        return lesson

    def get_skill(self, skill_id: int) -> Skill | None:
        return self.db.query(Skill).filter(Skill.id == skill_id).first()

    def get_first_skill_in_course(self, course_id: int = settings.DEFAULT_COURSE_ID) -> Skill | None:
        return (
            self.db.query(Skill)
            .join(Unit, Skill.unit_id == Unit.id)
            .filter(Unit.course_id == course_id)
            .order_by(Unit.order_index.asc(), Skill.order_index.asc())
            .first()
        )

    def get_primary_lesson_id_for_skill(self, skill_id: int) -> int | None:
        lesson = (
            self.db.query(Lesson)
            .filter(Lesson.skill_id == skill_id)
            .order_by(Lesson.order_index.asc(), Lesson.id.asc())
            .first()
        )
        return lesson.id if lesson else None

    def get_primary_lesson_ids_for_skills(self, skill_ids: list[int]) -> dict[int, int]:
        if not skill_ids:
            return {}

        lessons = (
            self.db.query(Lesson)
            .filter(Lesson.skill_id.in_(skill_ids))
            .order_by(Lesson.skill_id.asc(), Lesson.order_index.asc(), Lesson.id.asc())
            .all()
        )
        primary: dict[int, int] = {}
        for lesson in lessons:
            if lesson.skill_id not in primary:
                primary[lesson.skill_id] = lesson.id
        return primary

    def get_next_skill(self, current_skill_id: int) -> Skill | None:
        current_skill = self.get_skill(current_skill_id)
        if not current_skill: return None
        
        # Try next skill in same unit
        next_skill = self.db.query(Skill).filter(
            Skill.unit_id == current_skill.unit_id,
            Skill.order_index > current_skill.order_index
        ).order_by(Skill.order_index.asc()).first()
        
        if next_skill:
            return next_skill
            
        # Try first skill in next unit
        current_unit = self.db.query(Unit).filter(Unit.id == current_skill.unit_id).first()
        if not current_unit: return None
        
        next_unit = self.db.query(Unit).filter(
            Unit.course_id == current_unit.course_id,
            Unit.order_index > current_unit.order_index
        ).order_by(Unit.order_index.asc()).first()
        
        if next_unit:
            return self.db.query(Skill).filter(Skill.unit_id == next_unit.id).order_by(Skill.order_index.asc()).first()
            
        return None
