from sqlalchemy.orm import Session
from app.models.domain import User, UserStats

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()


class UserStatsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_stats_by_user_id(self, user_id: int) -> UserStats | None:
        return self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
