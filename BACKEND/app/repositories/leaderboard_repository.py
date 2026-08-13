from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.domain import UserStats, User

class LeaderboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_leaderboard(self) -> list[tuple]:
        return (
            self.db.query(User)
            .join(UserStats, User.id == UserStats.user_id)
            .with_entities(
                User.id,
                User.username,
                User.avatar_url,
                UserStats.total_xp,
                UserStats.current_streak
            )
            .order_by(UserStats.total_xp.desc(), User.id.asc())
            .all()
        )

    def get_user_rank(self, total_xp: int, user_id: int) -> int:
        count = (
            self.db.query(func.count(UserStats.id))
            .filter(
                (UserStats.total_xp > total_xp) | 
                ((UserStats.total_xp == total_xp) & (UserStats.user_id < user_id))
            )
            .scalar()
        )
        return count + 1
