"""Adversarial QA tests mapped to audit invariants (AGENTS.md, plan.md, docs/)."""

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.domain import (
    Course,
    Lesson,
    LessonAttempt,
    AttemptStatus,
    ProgressStatus,
    Skill,
    SkillProgress,
    Unit,
    User,
    UserStats,
)


def test_path_lesson_id_can_differ_from_skill_id(client, db):
    """Frontend must not assume skill.id === lesson.id."""
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(unit_id=unit.id, title="Skill A", icon="hand", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=99, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.commit()

    response = client.get("/api/v1/path")
    assert response.status_code == 200

    skill_payload = response.json()["units"][0]["skills"][0]
    assert skill_payload["id"] == skill.id
    assert skill_payload["lesson_id"] == 99
    assert skill_payload["lesson_id"] != skill_payload["id"]


def test_path_skill_without_lesson_returns_corrupted_state(client, db):
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(unit_id=unit.id, title="Orphan Skill", icon="hand", order_index=0)
    db.add(skill)
    db.commit()

    response = client.get("/api/v1/path")
    assert response.status_code == 409
    assert response.json()["detail"] == "CORRUPTED_LESSON_STATE"


def test_path_primary_lesson_is_lowest_order_index(client, db):
    course = Course(name="Test", source_language="en", target_language="es")
    db.add(course)
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(unit_id=unit.id, title="Multi", icon="hand", order_index=0)
    db.add(skill)
    db.flush()
    db.add_all([
        Lesson(id=50, skill_id=skill.id, order_index=1),
        Lesson(id=51, skill_id=skill.id, order_index=0),
    ])
    db.commit()

    response = client.get("/api/v1/path")
    assert response.status_code == 200
    assert response.json()["units"][0]["skills"][0]["lesson_id"] == 51


def test_me_response_exposes_only_contract_fields(client, db):
    user = User(id=1, username="contract_user")
    db.add(user)
    db.flush()
    db.add(
        UserStats(
            user_id=1,
            total_xp=100,
            current_streak=3,
            hearts=4,
            max_hearts=5,
            gems=500,
            daily_goal=10,
        )
    )
    db.commit()

    me = client.get("/api/v1/me")
    assert me.status_code == 200
    assert set(me.json().keys()) == {"id", "username", "avatar_url", "created_at"}

    stats = client.get("/api/v1/me/stats")
    assert stats.status_code == 200
    assert set(stats.json().keys()) == {
        "total_xp",
        "current_streak",
        "hearts",
        "max_hearts",
        "gems",
        "daily_goal",
    }


def test_start_lesson_applies_heart_regeneration_like_stats(client, db):
    """start_lesson and /me/stats must report the same regenerated heart count."""
    user = User(id=1, username="regen_parity")
    lost_time = datetime.now(timezone.utc) - timedelta(minutes=250)
    stats = UserStats(user_id=1, hearts=3, max_hearts=5, last_heart_lost_at=lost_time)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    db.add(SkillProgress(user_id=1, skill_id=skill.id, status=ProgressStatus.available))
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    from app.models.domain import Exercise, ExerciseType

    db.add(
        Exercise(
            lesson_id=lesson.id,
            order_index=0,
            type=ExerciseType.multiple_choice,
            prompt="Q",
            data={"options": ["A"]},
            correct_answer="A",
        )
    )
    db.commit()

    stats_res = client.get("/api/v1/me/stats")
    start_res = client.post("/api/v1/lessons/1/start")

    assert stats_res.status_code == 200
    assert start_res.status_code == 200
    assert stats_res.json()["hearts"] == 4
    assert start_res.json()["hearts_remaining"] == stats_res.json()["hearts"]


def test_completed_without_xp_awarded_rejects_complete(client, db):
    """Terminal completed rows missing xp_awarded must not be re-completed."""
    from app.models.domain import Exercise, ExerciseType

    user = User(id=1, username="bad_complete")
    stats = UserStats(user_id=1, hearts=5, total_xp=100)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    db.add(
        Exercise(
            lesson_id=lesson.id,
            order_index=0,
            type=ExerciseType.multiple_choice,
            prompt="Q",
            data={"options": ["A"]},
            correct_answer="A",
        )
    )
    db.flush()
    attempt = LessonAttempt(
        user_id=1,
        lesson_id=1,
        status=AttemptStatus.completed,
        current_exercise_index=1,
        xp_awarded=None,
    )
    db.add(attempt)
    db.commit()

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 409
    assert res.json()["detail"] == "ATTEMPT_ALREADY_TERMINATED"

    db.refresh(stats)
    assert stats.total_xp == 100


def test_answer_extra_authoritative_fields_are_ignored(client, db):
    """Client cannot inject XP/hearts via answer payload extras."""
    from app.models.domain import Exercise, ExerciseType

    user = User(id=1, username="inject")
    stats = UserStats(user_id=1, hearts=5, total_xp=100)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    db.add(
        Exercise(
            id=1,
            lesson_id=lesson.id,
            order_index=0,
            type=ExerciseType.multiple_choice,
            prompt="Q",
            data={"options": ["A", "B"]},
            correct_answer="A",
        )
    )
    db.flush()
    attempt = LessonAttempt(
        id=1,
        user_id=1,
        lesson_id=1,
        status=AttemptStatus.in_progress,
        current_exercise_index=0,
    )
    db.add(attempt)
    db.commit()

    res = client.post(
        "/api/v1/lesson-attempts/1/answers",
        json={
            "exercise_id": 1,
            "answer": "A",
            "xp": 999999,
            "hearts": 999,
            "completed": True,
        },
    )
    assert res.status_code == 200
    assert res.json()["hearts_remaining"] == 5

    db.refresh(stats)
    assert stats.total_xp == 100
    assert stats.hearts == 5


def test_complete_rejects_cursor_only_bypass_without_attempt_rows(client, db):
    """Cursor at end is insufficient — persisted ExerciseAttempt rows are required."""
    from app.models.domain import Exercise, ExerciseType

    user = User(id=1, username="cursor_bypass")
    stats = UserStats(user_id=1, hearts=5, total_xp=100)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    db.add_all([
        Exercise(
            lesson_id=lesson.id,
            order_index=0,
            type=ExerciseType.multiple_choice,
            prompt="Q1",
            data={"options": ["A"]},
            correct_answer="A",
        ),
        Exercise(
            lesson_id=lesson.id,
            order_index=1,
            type=ExerciseType.multiple_choice,
            prompt="Q2",
            data={"options": ["A"]},
            correct_answer="A",
        ),
    ])
    db.flush()
    attempt = LessonAttempt(
        user_id=1,
        lesson_id=1,
        status=AttemptStatus.in_progress,
        current_exercise_index=2,
    )
    db.add(attempt)
    db.commit()

    res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
    assert res.status_code == 409
    assert res.json()["detail"] == "LESSON_INCOMPLETE"

    db.refresh(stats)
    assert stats.total_xp == 100
    db.refresh(attempt)
    assert attempt.status == AttemptStatus.in_progress
    assert attempt.xp_awarded is None


def test_complete_forbidden_for_non_owner(client, db):
    """IDOR: another user's attempt must not be completable."""
    from app.api.deps import get_current_user
    from app.main import app
    from app.models.domain import Exercise, ExerciseType

    user = User(id=1, username="owner")
    other = User(id=2, username="intruder")
    stats = UserStats(user_id=1, hearts=5, total_xp=100)
    course = Course(id=1, name="Test", source_language="en", target_language="es")
    db.add_all([user, other, stats, course])
    db.flush()
    unit = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
    db.add(unit)
    db.flush()
    skill = Skill(id=1, unit_id=unit.id, title="Skill 1", icon="s", order_index=0)
    db.add(skill)
    db.flush()
    lesson = Lesson(id=1, skill_id=skill.id, order_index=0)
    db.add(lesson)
    db.flush()
    db.add(
        Exercise(
            lesson_id=lesson.id,
            order_index=0,
            type=ExerciseType.multiple_choice,
            prompt="Q",
            data={"options": ["A"]},
            correct_answer="A",
        )
    )
    db.flush()
    attempt = LessonAttempt(
        user_id=1,
        lesson_id=1,
        status=AttemptStatus.in_progress,
        current_exercise_index=1,
    )
    db.add(attempt)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: 2
    try:
        res = client.post(f"/api/v1/lesson-attempts/{attempt.id}/complete")
        assert res.status_code == 403
        assert res.json()["detail"] == "ATTEMPT_FORBIDDEN"
    finally:
        del app.dependency_overrides[get_current_user]

    db.refresh(stats)
    assert stats.total_xp == 100


def test_openapi_skill_path_response_includes_lesson_id():
    """Checked-in OpenAPI must expose lesson_id required by api-contract.md."""
    import json
    from pathlib import Path

    spec = json.loads(Path(__file__).resolve().parents[3].joinpath("docs/openapi.json").read_text())
    schema = spec["components"]["schemas"]["SkillPathResponse"]
    assert "lesson_id" in schema["properties"]
    assert "lesson_id" in schema["required"]
