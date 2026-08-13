from sqlalchemy.orm import Session, selectinload
from app.models.domain import Course, Unit

class LessonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_course_tree(self) -> list[Unit]:
        course = self.db.query(Course).first()
        if not course:
            return []
        
        return (
            self.db.query(Unit)
            .filter(Unit.course_id == course.id)
            .options(selectinload(Unit.skills))
            .order_by(Unit.order_index)
            .all()
        )
