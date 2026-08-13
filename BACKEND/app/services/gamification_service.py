from datetime import datetime, timezone
from app.models.domain import UserStats

class GamificationService:
    def handle_lesson_completed(self, user_stats: UserStats, xp_reward: int) -> None:
        today = datetime.now(timezone.utc).date()
        
        if user_stats.last_activity_date:
            delta = (today - user_stats.last_activity_date).days
            if delta == 1:
                user_stats.current_streak += 1
            elif delta > 1:
                user_stats.current_streak = 1
        else:
            user_stats.current_streak = 1
            
        if user_stats.current_streak > user_stats.longest_streak:
            user_stats.longest_streak = user_stats.current_streak
            
        if user_stats.last_activity_date == today:
            user_stats.daily_xp += xp_reward
        else:
            user_stats.daily_xp = xp_reward
            
        user_stats.last_activity_date = today
        user_stats.total_xp += xp_reward
