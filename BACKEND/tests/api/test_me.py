from app.models.domain import User, UserStats

def test_read_user_me(client, db):
    user = User(id=1, username="demo_learner")
    db.add(user)
    db.commit()

    response = client.get("/api/v1/me")
    assert response.status_code == 200
    assert response.json()["username"] == "demo_learner"
    assert response.json()["id"] == 1

def test_read_user_stats(client, db):
    user = User(id=1, username="demo_learner")
    db.add(user)
    db.flush()
    stats = UserStats(user_id=1, total_xp=340, current_streak=7, hearts=4, max_hearts=5)
    db.add(stats)
    db.commit()

    response = client.get("/api/v1/me/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_xp"] == 340
    assert data["current_streak"] == 7
    assert data["hearts"] == 4

def test_user_not_found(client):
    response = client.get("/api/v1/me")
    assert response.status_code == 404
    assert response.json()["detail"] == "USER_NOT_FOUND"
