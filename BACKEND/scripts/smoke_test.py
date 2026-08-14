#!/usr/bin/env python3
"""
End-to-end smoke test against a running backend.

Uses the deterministic Japanese seed (see seed.py lesson 1 exercise order).
Set API_BASE_URL (default http://localhost:8000).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

API_BASE = os.environ.get("API_BASE_URL", "http://localhost:8000").rstrip("/")
API_V1 = f"{API_BASE}/api/v1"

LESSON_1_ANSWERS: list[object] = [
    "あ",
    ["り"],
    ["ありがとう"],
    "い",
    ["し"],
]

def request(method: str, path: str, body: dict | None = None) -> dict:
    url = path if path.startswith("http") else f"{API_V1}{path}"
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if body is not None else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()
        raise RuntimeError(f"{method} {path} failed ({exc.code}): {detail}") from exc

def skill_by_id(path: dict, skill_id: int) -> dict:
    for unit in path["units"]:
        for skill in unit["skills"]:
            if skill["id"] == skill_id:
                return skill
    raise RuntimeError(f"Skill {skill_id} not found in path")

def main() -> int:
    print("==> Running smoke test <==")
    print(f"API base: {API_BASE}")

    health = request("GET", f"{API_BASE}/health-check")
    assert health.get("status") == "ok", health
    print("✓ health-check")

    me = request("GET", "/me")
    assert me.get("username") == "demo_learner", me
    print(f"✓ GET /me ({me['username']})")

    stats_before = request("GET", "/me/stats")
    print(f"✓ GET /me/stats (xp={stats_before['total_xp']}, hearts={stats_before['hearts']})")

    path_before = request("GET", "/path")
    assert path_before["units"], "path has no units"
    print(f"✓ GET /path ({len(path_before['units'])} units)")

    start = request("POST", "/lessons/1/start")
    attempt_id = start["attempt_id"]
    exercises = start["exercises"]
    hearts_at_start = start["hearts_remaining"]
    cursor_at_start = start["current_exercise_index"]
    print(f"✓ POST /lessons/1/start (attempt={attempt_id}, exercises={len(exercises)})")

    if len(exercises) != len(LESSON_1_ANSWERS):
        raise RuntimeError(
            f"Lesson 1 has {len(exercises)} exercises; smoke test expects {len(LESSON_1_ANSWERS)}. "
            "Update LESSON_1_ANSWERS in scripts/smoke_test.py to match seed.py."
        )

    exercise_types = {ex["type"] for ex in exercises}
    required_types = {
        "multiple_choice",
        "translate",
        "fill_blank",
    }
    missing = required_types - exercise_types
    if missing:
        raise RuntimeError(f"Lesson 1 seed missing exercise types: {sorted(missing)}")

    wrong = request(
        "POST",
        f"/lesson-attempts/{attempt_id}/answers",
        {"exercise_id": exercises[0]["id"], "answer": "wrong"},
    )
    assert wrong.get("correct") is False
    assert wrong["hearts_remaining"] == hearts_at_start - 1, (
        f"Expected hearts {hearts_at_start - 1}, got {wrong['hearts_remaining']}"
    )
    assert wrong["next_exercise_index"] == cursor_at_start, (
        "Wrong answer must not advance exercise cursor"
    )
    print("✓ wrong answer: hearts -1, cursor unchanged")

    for index, (exercise, answer) in enumerate(zip(exercises, LESSON_1_ANSWERS, strict=True)):
        result = request(
            "POST",
            f"/lesson-attempts/{attempt_id}/answers",
            {"exercise_id": exercise["id"], "answer": answer},
        )
        if not result.get("correct"):
            raise RuntimeError(
                f"Exercise {index + 1} ({exercise['type']}) expected correct; got {result}"
            )
        if result.get("lesson_failed"):
            raise RuntimeError(f"Lesson failed unexpectedly at exercise {index + 1}")

    print(f"✓ answered all {len(exercises)} exercises correctly")

    complete = request("POST", f"/lesson-attempts/{attempt_id}/complete")
    assert complete.get("xp_awarded", 0) > 0
    print(
        f"✓ POST /complete (xp_awarded={complete['xp_awarded']}, total_xp={complete['total_xp']})"
    )

    retry = request("POST", f"/lesson-attempts/{attempt_id}/complete")
    assert retry["xp_awarded"] == complete["xp_awarded"]
    print("✓ completion retry is idempotent for xp_awarded")

    path_after = request("GET", "/path")
    skill1 = skill_by_id(path_after, 1)
    skill2 = skill_by_id(path_after, 2)
    assert skill1["status"] == "completed", skill1
    assert skill2["status"] == "available", skill2
    print("✓ GET /path after completion (skill1 completed, skill2 available)")

    stats_after = request("GET", "/me/stats")
    print(f"✓ GET /me/stats after lesson (xp={stats_after['total_xp']})")

    leaderboard = request("GET", "/leaderboard")
    rank = leaderboard.get("current_user_rank")
    top = leaderboard["entries"][0]["username"] if leaderboard.get("entries") else "?"
    print(f"✓ GET /leaderboard (rank={rank}, leader={top})")

    if stats_after.get("hearts", 0) < stats_after.get("max_hearts", 5):
        refill = request("POST", "/me/hearts/refill")
        assert refill["hearts"] == refill["max_hearts"]
        print("✓ POST /me/hearts/refill")
    else:
        print("⊘ skipped heart refill (hearts already full)")

    print("\n==> Smoke test complete <==")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SMOKE TEST FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
