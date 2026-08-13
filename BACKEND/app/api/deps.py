from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.repositories.user_repository import UserRepository, UserStatsRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.user_service import UserService
from app.services.lesson_service import LessonService

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

def get_lesson_repo(db: Session = Depends(get_db)) -> LessonRepository:
    return LessonRepository(db)

def get_progress_repo(db: Session = Depends(get_db)) -> ProgressRepository:
    return ProgressRepository(db)

def get_lesson_service(
    lesson_repo: LessonRepository = Depends(get_lesson_repo),
    progress_repo: ProgressRepository = Depends(get_progress_repo)
) -> LessonService:
    return LessonService(lesson_repo=lesson_repo, progress_repo=progress_repo)
