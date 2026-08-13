# API Contract

All endpoints are versioned under `/api/v1/` and return structured Pydantic DTOs, not DB entities.
Authentication (for the 24-hour scope) is a dependency `get_current_user` injecting `DEFAULT_USER_ID=1` (demo user).

## Shared Error Structure

Domain errors return:

```json
{ "detail": "SKILL_LOCKED" }
```

FastAPI validation errors (422) return the standard `detail: [{ loc, msg, ... }]` array.

Custom domain error codes (`403`, `409`, `422`) are mapped in `app/main.py` but are **not** declared on individual route OpenAPI responses — consult `docs/error-taxonomy.md` for the full list.

---

## Answer payload shapes (`POST .../answers`)

`AnswerRequest.answer` is polymorphic. The evaluator for each exercise type expects:

| Exercise type | `answer` JSON shape | Example |
|---|---|---|
| `multiple_choice` | `string` | `"あ"` |
| `translate` | `string[]` | `["ありがとう"]` |
| `fill_blank` | `string[]` | `["り"]` |
| `match_pairs` | `object` (pair id → right option id) | `{"p1": "r1", "p2": "r2"}` |
| `type_answer` | `string` | `"a"` |

Malformed shapes return `422 INVALID_ANSWER_PAYLOAD`.

---

### `GET /api/v1/path`

- **Purpose**: Retrieves the full course tree and user's progress.
- **Authentication**: Required (`get_current_user`).
- **Success (200)**: `PathResponse`

```json
{
  "units": [
    {
      "id": 1,
      "title": "Basics & Greetings",
      "color_theme": "purple",
      "skills": [
        {
          "id": 1,
          "title": "Hiragana",
          "icon": "character",
          "status": "available",
          "crown_level": 0
        }
      ]
    }
  ]
}
```

---

### `POST /api/v1/lessons/{lesson_id}/start`

- **Purpose**: Starts or resumes a lesson attempt.
- **Authentication**: Required.
- **Path Parameters**: `lesson_id` (int).
- **Data Safety Boundary**: The response MUST NOT expose `Exercise.correct_answer`.
- **Success (200)**: `StartLessonResponse`

```json
{
  "attempt_id": 1,
  "current_exercise_index": 0,
  "hearts_remaining": 4,
  "exercises": [
    {
      "id": 1,
      "type": "multiple_choice",
      "prompt": "Select the character for 'あ'",
      "data": { "options": ["あ", "い", "う", "え"] }
    }
  ]
}
```

- **Errors**: `403 SKILL_LOCKED`, `404 LESSON_NOT_FOUND`, `409 LESSON_HAS_NO_EXERCISES`, `409 CORRUPTED_LESSON_STATE`

---

### `POST /api/v1/lesson-attempts/{attempt_id}/answers`

- **Purpose**: Submits an answer for the current exercise.
- **Request Body**: `AnswerRequest` (see table above).
- **Success (200)**: `AnswerResponse`

```json
{
  "correct": true,
  "correct_answer": "あ",
  "hearts_remaining": 4,
  "next_exercise_index": 1,
  "lesson_failed": false
}
```

Wrong answers that empty hearts return **HTTP 200** with `"lesson_failed": true` (not an error status).

- **Errors**: `404 ATTEMPT_NOT_FOUND`, `409 ATTEMPT_ALREADY_TERMINATED`, `409 EXERCISE_NOT_CURRENT`, …

---

### `POST /api/v1/lesson-attempts/{attempt_id}/complete`

- **Purpose**: Completes the lesson, updating XP, streak, and skill progress.
- **Idempotency**: If `xp_awarded` is already set on the attempt, returns cached `xp_awarded` / `crown_earned` without double-awarding XP. **`total_xp` and `streak` are read from current `UserStats` on every response** (including retries).
- **Success (200)**: `CompleteResponse`

```json
{
  "xp_awarded": 10,
  "total_xp": 350,
  "streak": 7,
  "crown_earned": true
}
```

---

### `GET /api/v1/me`

```json
{
  "id": 1,
  "username": "demo_learner",
  "avatar_url": null,
  "created_at": "2026-08-13T12:00:00"
}
```

---

### `GET /api/v1/me/stats`

Lazy heart regeneration may commit before returning.

```json
{
  "total_xp": 340,
  "current_streak": 7,
  "hearts": 4,
  "max_hearts": 5,
  "gems": 500,
  "daily_goal": 30
}
```

---

### `POST /api/v1/me/hearts/refill`

Costs **350 gems**. Refills hearts to `max_hearts`.

- **Errors**: `409 HEARTS_ALREADY_FULL`, `409 NOT_ENOUGH_GEMS`

---

### `GET /api/v1/leaderboard`

Sorted by `total_xp DESC`, tie-break `user_id ASC`.

```json
{
  "entries": [
    {
      "rank": 1,
      "user_id": 4,
      "username": "polyglot99",
      "avatar_url": null,
      "total_xp": 1200,
      "current_streak": 45
    },
    {
      "rank": 3,
      "user_id": 1,
      "username": "demo_learner",
      "avatar_url": null,
      "total_xp": 340,
      "current_streak": 7
    }
  ],
  "current_user_rank": 3
}
```

*(Illustrative — ranks reflect seeded demo data where `polyglot99` leads.)*

---

### `GET /health-check`

```json
{ "status": "ok" }
```
