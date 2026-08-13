from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_leaderboard_service
from app.services.leaderboard_service import LeaderboardService
from app.schemas.leaderboard import LeaderboardResponse

router = APIRouter()

@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    user_id: int = Depends(get_current_user),
    leaderboard_service: LeaderboardService = Depends(get_leaderboard_service)
):
    return leaderboard_service.get_leaderboard(current_user_id=user_id)
