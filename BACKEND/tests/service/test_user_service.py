import pytest
from app.models.domain import User, UserStats
from app.repositories.user_repository import UserRepository, UserStatsRepository
from app.services.user_service import UserService
from app.core.exceptions import NotFoundError

def test_get_me_success(db):
    user = User(id=1, username="test_user")
    db.add(user)
    db.commit()

    repo = UserRepository(db)
    stats_repo = UserStatsRepository(db)
    service = UserService(repo, stats_repo)

    result = service.get_me(1)
    assert result.username == "test_user"

def test_get_me_not_found(db):
    repo = UserRepository(db)
    stats_repo = UserStatsRepository(db)
    service = UserService(repo, stats_repo)

    with pytest.raises(NotFoundError) as excinfo:
        service.get_me(999)
    assert excinfo.value.resource == "USER"

def test_get_my_stats_success(db):
    user = User(id=1, username="test_user")
    db.add(user)
    db.flush()
    stats = UserStats(user_id=user.id, total_xp=100)
    db.add(stats)
    db.commit()

    repo = UserRepository(db)
    stats_repo = UserStatsRepository(db)
    service = UserService(repo, stats_repo)

    result = service.get_my_stats(1)
    assert result.total_xp == 100
