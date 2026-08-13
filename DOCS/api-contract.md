# API Contract

All endpoints are versioned under `/api/v1/` and return structured Pydantic DTOs, not DB entities.
Authentication (for the 24-hour scope) is a dependency `get_current_user` injecting a default user.

## Shared Error Structure
Errors return standard HTTP status codes with a JSON body mapping to a specific code:
```json
{
  "detail": "SKILL_LOCKED"
}
```

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
      "title": "Basics",
      "color_theme": "green",
      "skills": [
        {
          "id": 10,
          "title": "Greetings",
          "icon": "hand-wave",
          "status": "completed",
          "crown_level": 1
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
- **Validation Rules**: 
  - Fails if skill is locked server-side.
  - Fails if lesson has no exercises.
  - Fails if lesson doesn't exist.
- **Data Safety Boundary**: The API response MUST NEVER map or expose the `Exercise.correct_answer` field in the initial payload.
- **Success (200)**: `StartLessonResponse`
```json
{
  "attempt_id": 100,
  "current_exercise_index": 3,
  "hearts_remaining": 5,
  "exercises": [
    {
      "id": 101,
      "type": "multiple_choice",
      "prompt": "Translate: Hello",
      "data": { "options": ["Hola", "Adiós", "Gracias", "Casa"] }
    }
  ]
}
```
- **Errors**:
  - `403 Forbidden` - `SKILL_LOCKED`
  - `404 Not Found` - `LESSON_NOT_FOUND`
  - `409 Conflict` - `LESSON_HAS_NO_EXERCISES`
  - `409 Conflict` - `CORRUPTED_LESSON_STATE`

---

### `POST /api/v1/lesson-attempts/{attempt_id}/answers`
- **Purpose**: Submits an answer for an exercise.
- **Authentication**: Required.
- **Path Parameters**: `attempt_id` (int).
- **Request Body**: `AnswerRequest`
```json
{
  "exercise_id": 101,
  "answer": "Hola" 
}
```
- **Validation**: Fails if answer shape is malformed (`422 INVALID_ANSWER_PAYLOAD`).
- **Data Safety Boundary**: The `correct_answer` may safely be returned as post-submission feedback once the user has already committed their answer.
- **Success (200)**: `AnswerResponse`
```json
{
  "correct": true,
  "correct_answer": "Hola",
  "hearts_remaining": 5,
  "next_exercise_index": 1,
  "lesson_failed": false
}
```
*(Note: A wrong answer emptying hearts returns a 200 with `lesson_failed: true`, not an HTTP error).*
- **Errors**:
  - `404 Not Found` - `ATTEMPT_NOT_FOUND`
  - `409 Conflict` - `ATTEMPT_ALREADY_TERMINATED`

---

### `POST /api/v1/lesson-attempts/{attempt_id}/complete`
- **Purpose**: Completes the lesson, updating XP, streak, and skill progress.
- **Authentication**: Required.
- **Path Parameters**: `attempt_id` (int).
- **Idempotency**: Returns cached result if `xp_awarded` is already set.
- **Success (200)**: `CompleteResponse`
```json
{
  "xp_awarded": 15,
  "total_xp": 355,
  "streak": 7,
  "crown_earned": false
}
```
- **Errors**:
  - `409 Conflict` - `LESSON_INCOMPLETE` (not all exercises answered)
  - `409 Conflict` - `ATTEMPT_ALREADY_TERMINATED` (if previously failed)
  - `404 Not Found` - `ATTEMPT_NOT_FOUND`

---

### `GET /api/v1/me`
- **Purpose**: Retrieve profile data.
- **Authentication**: Required.
- **Success (200)**: `UserResponse`
```json
{
  "id": 1,
  "username": "demo_learner",
  "avatar_url": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### `GET /api/v1/me/stats`
- **Purpose**: Retrieve gamification stats (XP, streak, hearts).
- **Authentication**: Required.
- **Success (200)**: `UserStatsResponse`
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
- **Purpose**: Buy hearts using gems.
- **Authentication**: Required.
- **Success (200)**: `UserStatsResponse` (updated).

---

### `GET /api/v1/leaderboard`
- **Purpose**: Retrieve top users by XP.
- **Success (200)**: `LeaderboardResponse`
```json
{
  "entries": [
    { "user_id": 1, "username": "demo_learner", "total_xp": 340, "rank": 1 }
  ]
}
```

---

### `GET /health-check`
- **Purpose**: System health check for load balancers and up-time monitoring.
- **Authentication**: None.
- **Success (200)**:
```json
{
  "status": "ok"
}
```
