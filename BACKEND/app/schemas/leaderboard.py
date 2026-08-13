from pydantic import BaseModel
from typing import List, Optional

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    total_xp: int
    current_streak: int

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    current_user_rank: Optional[int] = None
