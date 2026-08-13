from datetime import datetime, timezone, timedelta
from app.models.domain import UserStats

class GamificationService:
    HEART_REGEN_INTERVAL_SECONDS = 14400 # 4 hours
    HEART_REFILL_COST = 350
    
    def regenerate_hearts(self, user_stats: UserStats) -> bool:
        if user_stats.hearts >= user_stats.max_hearts:
            if user_stats.last_heart_lost_at is not None:
                user_stats.last_heart_lost_at = None
                return True
            return False
            
        if not user_stats.last_heart_lost_at:
            user_stats.last_heart_lost_at = datetime.now(timezone.utc)
            return True
            
        now = datetime.now(timezone.utc)
        if user_stats.last_heart_lost_at.tzinfo is None:
            last_lost = user_stats.last_heart_lost_at.replace(tzinfo=timezone.utc)
        else:
            last_lost = user_stats.last_heart_lost_at
            
        elapsed = (now - last_lost).total_seconds()
        
        if elapsed >= self.HEART_REGEN_INTERVAL_SECONDS:
            hearts_to_regen = int(elapsed // self.HEART_REGEN_INTERVAL_SECONDS)
            new_hearts = min(user_stats.max_hearts, user_stats.hearts + hearts_to_regen)
            
            if new_hearts > user_stats.hearts:
                user_stats.hearts = new_hearts
                if new_hearts == user_stats.max_hearts:
                    user_stats.last_heart_lost_at = None
                else:
                    user_stats.last_heart_lost_at = last_lost + timedelta(seconds=hearts_to_regen * self.HEART_REGEN_INTERVAL_SECONDS)
                return True
        return False

    def consume_heart(self, user_stats: UserStats) -> None:
        self.regenerate_hearts(user_stats)
        if user_stats.hearts > 0:
            if user_stats.hearts == user_stats.max_hearts:
                user_stats.last_heart_lost_at = datetime.now(timezone.utc)
            user_stats.hearts -= 1

    def refill_hearts(self, user_stats: UserStats) -> None:
        user_stats.gems -= self.HEART_REFILL_COST
        user_stats.hearts = user_stats.max_hearts
        user_stats.last_heart_lost_at = None

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
