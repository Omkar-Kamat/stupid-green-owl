from app.repositories.leaderboard_repository import LeaderboardRepository
from app.repositories.user_repository import UserStatsRepository
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry

class LeaderboardService:
    def __init__(self, leaderboard_repo: LeaderboardRepository, stats_repo: UserStatsRepository):
        self.leaderboard_repo = leaderboard_repo
        self.stats_repo = stats_repo

    def get_leaderboard(self, current_user_id: int) -> LeaderboardResponse:
        results = self.leaderboard_repo.get_leaderboard()
        
        entries = []
        for rank, row in enumerate(results, start=1):
            user_id, username, avatar_url, total_xp, current_streak = row
            entries.append(LeaderboardEntry(
                rank=rank,
                user_id=user_id,
                username=username,
                avatar_url=avatar_url,
                total_xp=total_xp,
                current_streak=current_streak
            ))
            
        current_user_rank = None
        current_stats = self.stats_repo.get_stats_by_user_id(current_user_id)
        if current_stats:
            current_user_rank = self.leaderboard_repo.get_user_rank(
                total_xp=current_stats.total_xp,
                user_id=current_user_id
            )
            
        return LeaderboardResponse(
            entries=entries,
            current_user_rank=current_user_rank
        )
