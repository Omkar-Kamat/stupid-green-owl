from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserResponse(BaseModel):
    id: int
    username: str
    avatar_url: str | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserStatsResponse(BaseModel):
    total_xp: int
    current_streak: int
    hearts: int
    max_hearts: int

    model_config = ConfigDict(from_attributes=True)
