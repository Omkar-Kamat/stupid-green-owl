from app.models.domain import User, UserStats
from app.repositories.user_repository import UserRepository, UserStatsRepository
from app.core.exceptions import NotFoundError

class UserService:
    def __init__(self, user_repo: UserRepository, stats_repo: UserStatsRepository):
        self.user_repo = user_repo
        self.stats_repo = stats_repo

    def get_me(self, user_id: int) -> User:
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise NotFoundError("USER", user_id)
        return user

    def get_my_stats(self, user_id: int) -> UserStats:
        stats = self.stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise NotFoundError("USER_STATS", user_id)
        return stats
