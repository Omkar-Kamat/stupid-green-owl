import pytest
from app.models.domain import User, UserStats

@pytest.fixture
def empty_leaderboard(db):
    # clear db stats and users for empty test
    db.query(UserStats).delete()
    db.query(User).delete()
    db.commit()

def test_leaderboard_ordering_and_tie_breaking(client, db, empty_leaderboard):
    # Multiple users with unique XP, multiple with equal XP
    # User 1: 500 XP
    # User 2: 500 XP
    # User 3: 400 XP
    # User 4: 600 XP
    users = [
        User(id=1, username="user1"),
        User(id=2, username="user2"),
        User(id=3, username="user3"),
        User(id=4, username="user4")
    ]
    db.add_all(users)
    db.flush()
    stats = [
        UserStats(user_id=1, total_xp=500),
        UserStats(user_id=2, total_xp=500),
        UserStats(user_id=3, total_xp=400),
        UserStats(user_id=4, total_xp=600),
    ]
    db.add_all(stats)
    db.commit()

    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    entries = data["entries"]

    assert len(entries) == 4
    
    # 4 is first (600 xp)
    assert entries[0]["user_id"] == 4
    assert entries[0]["rank"] == 1
    
    # 1 is second (500 xp, id 1)
    assert entries[1]["user_id"] == 1
    assert entries[1]["rank"] == 2
    
    # 2 is third (500 xp, id 2)
    assert entries[2]["user_id"] == 2
    assert entries[2]["rank"] == 3
    
    # 3 is fourth (400 xp)
    assert entries[3]["user_id"] == 3
    assert entries[3]["rank"] == 4
    
    # Default user is 1 (as per deps.py)
    assert data["current_user_rank"] == 2

def test_empty_leaderboard(client, db, empty_leaderboard):
    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert data["entries"] == []
    assert data["current_user_rank"] is None

def test_single_user_leaderboard(client, db, empty_leaderboard):
    db.add(User(id=1, username="single_user"))
    db.flush()
    db.add(UserStats(user_id=1, total_xp=100))
    db.commit()

    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert len(data["entries"]) == 1
    assert data["entries"][0]["rank"] == 1
    assert data["current_user_rank"] == 1

def test_current_user_missing_stats(client, db, empty_leaderboard):
    # Only users 2 and 3 have stats. User 1 has no stats.
    db.add(User(id=1, username="user1"))
    db.add(User(id=2, username="user2"))
    db.flush()
    db.add(UserStats(user_id=2, total_xp=50))
    db.commit()

    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert len(data["entries"]) == 1
    assert data["entries"][0]["user_id"] == 2
    assert data["current_user_rank"] is None # Missing stats means no rank

def test_current_user_at_top(client, db, empty_leaderboard):
    db.add_all([User(id=1, username="user1"), User(id=2, username="user2")])
    db.flush()
    db.add_all([UserStats(user_id=1, total_xp=1000), UserStats(user_id=2, total_xp=100)])
    db.commit()

    res = client.get("/api/v1/leaderboard")
    data = res.json()
    assert data["current_user_rank"] == 1

def test_current_user_at_bottom(client, db, empty_leaderboard):
    db.add_all([User(id=1, username="user1"), User(id=2, username="user2")])
    db.flush()
    db.add_all([UserStats(user_id=1, total_xp=10), UserStats(user_id=2, total_xp=100)])
    db.commit()

    res = client.get("/api/v1/leaderboard")
    data = res.json()
    assert data["current_user_rank"] == 2

def test_response_schema_dto(client, db, empty_leaderboard):
    db.add(User(id=1, username="test_schema", avatar_url="http://example.com/avatar.png"))
    db.flush()
    db.add(UserStats(user_id=1, total_xp=1200, current_streak=45))
    db.commit()

    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    
    assert "entries" in data
    assert "current_user_rank" in data
    
    entry = data["entries"][0]
    assert entry["rank"] == 1
    assert entry["user_id"] == 1
    assert entry["username"] == "test_schema"
    assert entry["avatar_url"] == "http://example.com/avatar.png"
    assert entry["total_xp"] == 1200
    assert entry["current_streak"] == 45

def test_deterministic_ordering_across_repeated_requests(client, db, empty_leaderboard):
    users = [User(id=i, username=f"user{i}") for i in range(1, 6)]
    db.add_all(users)
    db.flush()
    # All same XP
    stats = [UserStats(user_id=i, total_xp=500) for i in range(1, 6)]
    db.add_all(stats)
    db.commit()

    # Repeated requests should have identical order
    order1 = [e["user_id"] for e in client.get("/api/v1/leaderboard").json()["entries"]]
    order2 = [e["user_id"] for e in client.get("/api/v1/leaderboard").json()["entries"]]
    order3 = [e["user_id"] for e in client.get("/api/v1/leaderboard").json()["entries"]]
    
    assert order1 == [1, 2, 3, 4, 5]
    assert order1 == order2 == order3
