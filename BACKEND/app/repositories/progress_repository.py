from sqlalchemy.orm import Session
from app.models.domain import SkillProgress

class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_progress(self, user_id: int) -> dict[int, SkillProgress]:
        rows = self.db.query(SkillProgress).filter(SkillProgress.user_id == user_id).all()
        return {r.skill_id: r for r in rows}
