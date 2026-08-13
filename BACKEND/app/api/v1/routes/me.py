from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse, UserStatsResponse
from app.services.user_service import UserService
from app.api.deps import get_current_user, get_user_service

router = APIRouter()

@router.get("", response_model=UserResponse)
def read_user_me(
    current_user_id: int = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_me(current_user_id)

@router.get("/stats", response_model=UserStatsResponse)
def read_user_stats(
    current_user_id: int = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_my_stats(current_user_id)
