import pytest
from datetime import datetime, timezone, timedelta
from app.models.domain import User, UserStats

@pytest.fixture
def setup_user(db):
    user = User(id=1, username="test_regen")
    db.add(user)
    db.commit()
    return user

def test_hearts_already_full(client, db, setup_user):
    stats = UserStats(user_id=1, hearts=5, max_hearts=5, last_heart_lost_at=datetime.now(timezone.utc))
    db.add(stats)
    db.commit()

    res = client.get("/api/v1/me/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["hearts"] == 5

    # Check DB - last_heart_lost_at should be cleared
    db.refresh(stats)
    assert stats.last_heart_lost_at is None

def test_one_heart_lost_recently_no_regen(client, db, setup_user):
    lost_time = datetime.now(timezone.utc) - timedelta(minutes=30)
    stats = UserStats(user_id=1, hearts=4, max_hearts=5, last_heart_lost_at=lost_time)
    db.add(stats)
    db.commit()

    res = client.get("/api/v1/me/stats")
    assert res.status_code == 200
    assert res.json()["hearts"] == 4

def test_enough_elapsed_time_one_heart(client, db, setup_user):
    # Interval is 4 hours = 240 mins
    lost_time = datetime.now(timezone.utc) - timedelta(minutes=250)
    stats = UserStats(user_id=1, hearts=3, max_hearts=5, last_heart_lost_at=lost_time)
    db.add(stats)
    db.commit()

    res = client.get("/api/v1/me/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["hearts"] == 4
    
    db.refresh(stats)
    # The timer should be advanced by exactly 4 hours
    expected_new_timer = lost_time + timedelta(seconds=14400)
    assert abs((stats.last_heart_lost_at.replace(tzinfo=timezone.utc) - expected_new_timer).total_seconds()) < 2

def test_enough_elapsed_time_multiple_hearts_capped(client, db, setup_user):
    # 24 hours ago - enough to regenerate 6 hearts, but cap is 5.
    lost_time = datetime.now(timezone.utc) - timedelta(hours=24)
    stats = UserStats(user_id=1, hearts=1, max_hearts=5, last_heart_lost_at=lost_time)
    db.add(stats)
    db.commit()

    res = client.get("/api/v1/me/stats")
    assert res.status_code == 200
    assert res.json()["hearts"] == 5
    
    db.refresh(stats)
    assert stats.last_heart_lost_at is None

def test_missing_last_heart_lost_at(client, db, setup_user):
    stats = UserStats(user_id=1, hearts=3, max_hearts=5, last_heart_lost_at=None)
    db.add(stats)
    db.commit()

    res = client.get("/api/v1/me/stats")
    assert res.status_code == 200
    assert res.json()["hearts"] == 3
    
    db.refresh(stats)
    assert stats.last_heart_lost_at is not None

def test_repeated_stats_requests_do_not_over_regenerate(client, db, setup_user):
    lost_time = datetime.now(timezone.utc) - timedelta(hours=5)
    stats = UserStats(user_id=1, hearts=3, max_hearts=5, last_heart_lost_at=lost_time)
    db.add(stats)
    db.commit()

    r1 = client.get("/api/v1/me/stats")
    assert r1.json()["hearts"] == 4
    
    r2 = client.get("/api/v1/me/stats")
    assert r2.json()["hearts"] == 4

def test_refill_endpoint_success(client, db, setup_user):
    stats = UserStats(user_id=1, hearts=1, max_hearts=5, gems=1000)
    db.add(stats)
    db.commit()

    res = client.post("/api/v1/me/hearts/refill")
    assert res.status_code == 200
    data = res.json()
    assert data["hearts"] == 5
    assert data["gems"] == 650 # 1000 - 350
    
    db.refresh(stats)
    assert stats.hearts == 5
    assert stats.last_heart_lost_at is None

def test_refill_endpoint_not_enough_gems(client, db, setup_user):
    stats = UserStats(user_id=1, hearts=1, max_hearts=5, gems=100)
    db.add(stats)
    db.commit()

    res = client.post("/api/v1/me/hearts/refill")
    assert res.status_code == 409
    assert res.json()["detail"] == "NOT_ENOUGH_GEMS"
    
def test_refill_endpoint_already_full(client, db, setup_user):
    stats = UserStats(user_id=1, hearts=5, max_hearts=5, gems=1000)
    db.add(stats)
    db.commit()

    res = client.post("/api/v1/me/hearts/refill")
    assert res.status_code == 409
    assert res.json()["detail"] == "HEARTS_ALREADY_FULL"

def test_forced_db_failure_no_partial_update(client, db, setup_user, monkeypatch):
    stats = UserStats(user_id=1, hearts=1, max_hearts=5, gems=1000)
    db.add(stats)
    db.commit()

    def mock_commit():
        raise Exception("DB_FAIL")
        
    monkeypatch.setattr(db, "commit", mock_commit)
    
    with pytest.raises(Exception, match="DB_FAIL"):
        client.post("/api/v1/me/hearts/refill")
        
    db.rollback()
    db.refresh(stats)
    assert stats.hearts == 1
    assert stats.gems == 1000
