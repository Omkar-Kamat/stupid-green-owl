# API Contract

Target contract for all HTTP endpoints. Describes **required behavior**; where the current implementation differs, see [Implementation Notes](#implementation-notes).

- **Versioned API prefix:** `/api/v1`
- **OpenAPI spec (canonical):** `docs/openapi.json` — regenerate with `BACKEND/scripts/export_openapi.sh` while server is running
- **Error codes:** `docs/error-taxonomy.md`
- **Auth (demo scope):** `get_current_user` → `DEFAULT_USER_ID=1`; no auth headers required

All success responses use Pydantic DTOs, not raw ORM entities. Services return explicit DTOs for user and lesson routes.

---

## Shared Conventions

### Authentication

Every `/api/v1/*` endpoint requires the `get_current_user` dependency. In demo mode this always resolves to user id `1`. No `Authorization` header is read.

### Error shape

Domain errors:

```json
{ "detail": "SKILL_LOCKED" }
```

FastAPI/Pydantic validation (422):

```json
{
  "detail": [
    { "loc": ["body", "answer"], "msg": "...", "type": "..." }
  ]
}
```

### Server-authoritative fields

The client must **never** send: XP, hearts, streak, skill status, crown level, or completion flags. Only:

- `exercise_id` + `answer` on answer submit
- Path params (`lesson_id`, `attempt_id`) on resource URLs

---

## Endpoints

### `GET /health-check`

Unversioned health probe for deploy scripts and smoke tests.

| | |
|---|---|
| **Auth** | None |
| **Success** | `200` |

```json
{ "status": "ok" }
```

---

### `GET /api/v1/me`

| | |
|---|---|
| **Purpose** | Current user profile |
| **Auth** | Required |
| **Success** | `200` `UserResponse` |

```json
{
  "id": 1,
  "username": "demo_learner",
  "avatar_url": null,
  "created_at": "2026-08-13T12:00:00"
}
```

| Error | Code |
|---|---|
| 404 | `USER_NOT_FOUND` |

---

### `GET /api/v1/me/stats`

| | |
|---|---|
| **Purpose** | Authoritative gamification stats |
| **Auth** | Required |
| **Side effect** | Lazy heart regeneration may **commit** before response |
| **Success** | `200` `UserStatsResponse` |

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

**Not exposed:** `daily_xp` (stored server-side; frontend daily-quest UI is placeholder).

| Error | Code |
|---|---|
| 404 | `USER_STATS_NOT_FOUND` |

---

### `POST /api/v1/me/hearts/refill`

| | |
|---|---|
| **Purpose** | Spend gems to refill hearts to max |
| **Auth** | Required |
| **Body** | None |
| **Cost** | 350 gems (server-enforced) |
| **Success** | `200` `UserStatsResponse` (updated) |

| Error | Code |
|---|---|
| 409 | `HEARTS_ALREADY_FULL` |
| 409 | `NOT_ENOUGH_GEMS` |

---

### `GET /api/v1/path`

| | |
|---|---|
| **Purpose** | Course tree merged with user skill progress |
| **Auth** | Required |
| **Success** | `200` `PathResponse` |

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
          "crown_level": 0,
          "lesson_id": 1
        }
      ]
    }
  ]
}
```

**Skill status values:** `locked`, `available`, `completed`.

Each skill includes `lesson_id` — the primary lesson to start for that skill (lowest `order_index`). Clients must use this field for lesson links, not `skill.id`.

---

### `POST /api/v1/lessons/{lesson_id}/start`

| | |
|---|---|
| **Purpose** | Start or resume a lesson attempt |
| **Auth** | Required |
| **Path params** | `lesson_id` (int) |
| **Success** | `200` `StartLessonResponse` |

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

**Data safety:** `correct_answer` is **never** included in start response.

**Behavior:**

- If an `in_progress` attempt exists → resume it (same `attempt_id`, current cursor).
- If latest attempt is `completed` or `failed` → create **new** `in_progress` attempt.
- Concurrent starts → partial unique index + IntegrityError recovery → return winning attempt.

| Error | Code |
|---|---|
| 403 | `SKILL_LOCKED` |
| 404 | `LESSON_NOT_FOUND` |
| 409 | `LESSON_HAS_NO_EXERCISES` |
| 409 | `CORRUPTED_LESSON_STATE` |
| 409 | `CORRUPTED_USER_STATS` |

---

### `POST /api/v1/lesson-attempts/{attempt_id}/answers`

| | |
|---|---|
| **Purpose** | Submit answer for current exercise |
| **Auth** | Required + attempt ownership |
| **Path params** | `attempt_id` (int) |
| **Body** | `AnswerRequest` |

```json
{
  "exercise_id": 1,
  "answer": "あ"
}
```

#### Answer payload shapes

| Exercise type | `answer` JSON type | Example |
|---|---|---|
| `multiple_choice` | string | `"あ"` |
| `translate` | string[] | `["ありがとう"]` |
| `fill_blank` | string[] | `["り"]` |
| `match_pairs` | object (pair id → right option id) | `{"p1": "r1", "p2": "r2"}` |
| `type_answer` | string | `"a"` |

Malformed client shapes → `422 INVALID_ANSWER_PAYLOAD`.

**Success** `200` `AnswerResponse`:

```json
{
  "correct": true,
  "correct_answer": "あ",
  "hearts_remaining": 4,
  "next_exercise_index": 1,
  "lesson_failed": false
}
```

**Wrong answer:** HTTP 200, `correct: false`, cursor unchanged, heart −1 (if hearts > 0).

**Hearts exhausted:** HTTP 200, `lesson_failed: true`, attempt → `failed`. **Not** HTTP 403.

| Error | Code |
|---|---|
| 403 | `ATTEMPT_FORBIDDEN` |
| 404 | `ATTEMPT_NOT_FOUND` |
| 409 | `ATTEMPT_ALREADY_TERMINATED` |
| 409 | `EXERCISE_NOT_CURRENT` |
| 409 | `EXERCISE_NOT_IN_LESSON` |
| 409 | `EXERCISE_ALREADY_ANSWERED` |
| 409 | `CORRUPTED_LESSON_STATE` |
| 409 | `UNSUPPORTED_EXERCISE_TYPE` |
| 422 | `INVALID_ANSWER_PAYLOAD` |

---

### `POST /api/v1/lesson-attempts/{attempt_id}/complete`

| | |
|---|---|
| **Purpose** | Finalize lesson; award XP, update streak, progress, unlock |
| **Auth** | Required + attempt ownership |
| **Body** | None |
| **Success** | `200` `CompleteResponse` |

```json
{
  "xp_awarded": 10,
  "total_xp": 350,
  "streak": 7,
  "crown_earned": true
}
```

#### Idempotency

- **Side effects (XP to UserStats):** awarded **at most once** per attempt; gated by `attempt.status == completed` and `xp_awarded`.
- **Retry after completion:** returns cached `xp_awarded` and `crown_earned`; does **not** re-add XP.
- **`total_xp` and `streak`:** read from current `UserStats` on every response, including retries — not a frozen snapshot.
- **Concurrent in-flight completes:** conditional `try_complete_attempt` gate; loser polls briefly and returns cached completion when the winner commits (SQLite/threaded HTTP remains environment-limited).

| Error | Code |
|---|---|
| 403 | `ATTEMPT_FORBIDDEN` |
| 404 | `ATTEMPT_NOT_FOUND` |
| 409 | `ATTEMPT_ALREADY_TERMINATED` |
| 409 | `LESSON_INCOMPLETE` |
| 409 | `CORRUPTED_LESSON_STATE` |
| 409 | `CORRUPTED_USER_STATS` |

---

### `GET /api/v1/leaderboard`

| | |
|---|---|
| **Purpose** | XP-ranked users |
| **Auth** | Required |
| **Sort** | `total_xp DESC`, tie-break `user_id ASC` |
| **Success** | `200` `LeaderboardResponse` |

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
    }
  ],
  "current_user_rank": 3
}
```

---

## Frontend Integration Map

| Frontend call | Endpoint | Component |
|---|---|---|
| `meApi.getProfile()` | `GET /me` | `ProfileContent` |
| `meApi.getStats()` | `GET /me/stats` | `UserStatsProvider`, `ProfileContent` |
| `meApi.refillHearts()` | `POST /me/hearts/refill` | `ShopContent` |
| `pathApi.getPath()` | `GET /path` | `LearningPath` |
| `lessonApi.start(id)` | `POST /lessons/{id}/start` | `ApiLessonPlayer` |
| `lessonApi.answer(id, body)` | `POST /lesson-attempts/{id}/answers` | `ApiLessonPlayer` |
| `lessonApi.complete(id)` | `POST /lesson-attempts/{id}/complete` | `ApiLessonPlayer` |
| `leaderboardApi.getLeaderboard()` | `GET /leaderboard` | `LeaderboardContent` |

**Not called by frontend:** `/health-check` (scripts only).

**Demo auth:** `lib/demoAuth.ts` writes `localStorage` but sends **no** auth headers. Backend always uses `DEFAULT_USER_ID=1`.

---

## Implementation Notes

Resolved gaps (verified in code/tests):

| Area | Status |
|---|---|
| User DTO mapping | `UserService` returns explicit `UserResponse` / `UserStatsResponse` |
| Skill → lesson routing | Path returns `lesson_id`; frontend links use it |
| Concurrent complete | Conditional `try_complete_attempt` + idempotent cached response |
| Heart regen on start | `start_lesson` calls `regenerate_hearts` before reporting hearts |
| OpenAPI route errors | Domain errors not per-route in OpenAPI — consult `error-taxonomy.md` (intentional for demo) |

Remaining optional gaps: expose `daily_xp` in API if daily-quest UI ships.
