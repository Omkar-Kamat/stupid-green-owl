from app.models.domain import User, UserStats
from app.repositories.user_repository import UserRepository, UserStatsRepository
from app.services.gamification_service import GamificationService
from app.core.exceptions import NotFoundError, ConflictError

class UserService:
    def __init__(self, user_repo: UserRepository, stats_repo: UserStatsRepository, gamification_service: GamificationService):
        self.user_repo = user_repo
        self.stats_repo = stats_repo
        self.gamification_service = gamification_service

    def get_me(self, user_id: int) -> User:
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise NotFoundError("USER", user_id)
        return user

    def get_my_stats(self, user_id: int) -> UserStats:
        stats = self.stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise NotFoundError("USER_STATS", user_id)
            
        if self.gamification_service.regenerate_hearts(stats):
            try:
                self.stats_repo.db.commit()
            except Exception:
                self.stats_repo.db.rollback()
                raise
            
        return stats

    def refill_hearts(self, user_id: int) -> UserStats:
        stats = self.stats_repo.get_stats_by_user_id(user_id)
        if not stats:
            raise NotFoundError("USER_STATS", user_id)
            
        self.gamification_service.regenerate_hearts(stats)
        
        if stats.hearts >= stats.max_hearts:
            raise ConflictError("HEARTS_ALREADY_FULL")
            
        if stats.gems < self.gamification_service.HEART_REFILL_COST:
            raise ConflictError("NOT_ENOUGH_GEMS")
            
        self.gamification_service.refill_hearts(stats)
        try:
            self.stats_repo.db.commit()
        except Exception:
            self.stats_repo.db.rollback()
            raise
        return stats
