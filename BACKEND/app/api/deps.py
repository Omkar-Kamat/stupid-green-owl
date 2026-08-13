from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.repositories.user_repository import UserRepository, UserStatsRepository
from app.services.user_service import UserService

def get_current_user() -> int:
    # Fake authentication dependency returning DEFAULT_USER_ID
    return settings.DEFAULT_USER_ID

def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_stats_repo(db: Session = Depends(get_db)) -> UserStatsRepository:
    return UserStatsRepository(db)

def get_user_service(
    user_repo: UserRepository = Depends(get_user_repo),
    stats_repo: UserStatsRepository = Depends(get_stats_repo)
) -> UserService:
    return UserService(user_repo=user_repo, stats_repo=stats_repo)
