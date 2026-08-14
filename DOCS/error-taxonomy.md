# Error Taxonomy

Canonical mapping of domain errors to HTTP responses for the Stupid Green Owl backend.

**Implementation:** `BACKEND/app/core/exceptions.py` (exception types), `BACKEND/app/main.py` (handlers).

**API contract:** `docs/api-contract.md`

---

## Response Shape

All domain errors return a JSON object with a string `detail` code:

```json
{ "detail": "SKILL_LOCKED" }
```

FastAPI/Pydantic request validation errors (422) use the standard array form:

```json
{
  "detail": [
    { "loc": ["body", "answer"], "msg": "...", "type": "..." }
  ]
}
```

Unhandled exceptions return 500 with FastAPI default body (no stack trace in production config).

---

## Handler Mapping

| Exception class | HTTP status | `detail` format |
|---|---|---|
| `NotFoundError(resource, id)` | 404 | `{RESOURCE}_NOT_FOUND` |
| `ForbiddenError(reason)` | 403 | `{reason}` |
| `ConflictError(reason)` | 409 | `{reason}` |
| `InvalidPayloadError(reason)` | 422 | `{reason}` |

---

## 404 Not Found

Raised by `NotFoundError("RESOURCE", id)`.

| Code | When |
|---|---|
| `USER_NOT_FOUND` | User id does not exist |
| `USER_STATS_NOT_FOUND` | No stats row for user |
| `ATTEMPT_NOT_FOUND` | Lesson attempt id does not exist |
| `LESSON_NOT_FOUND` | Lesson id does not exist |

---

## 403 Forbidden

Raised by `ForbiddenError("REASON")`.

| Code | When |
|---|---|
| `SKILL_LOCKED` | User tries to start a lesson for a locked skill |
| `ATTEMPT_FORBIDDEN` | Authenticated user does not own the lesson attempt |

---

## 409 Conflict

Raised by `ConflictError("REASON")`.

| Code | When |
|---|---|
| `ATTEMPT_ALREADY_TERMINATED` | Answer or complete on `completed`/`failed` attempt; or completed with corrupted null `xp_awarded` |
| `LESSON_INCOMPLETE` | Complete called before all exercises answered |
| `LESSON_HAS_NO_EXERCISES` | Start called on lesson with zero exercises |
| `EXERCISE_NOT_CURRENT` | Submitted `exercise_id` does not match attempt cursor |
| `EXERCISE_NOT_IN_LESSON` | Submitted exercise not in attempt's lesson |
| `EXERCISE_ALREADY_ANSWERED` | Duplicate correct answer (partial unique index) |
| `CORRUPTED_LESSON_STATE` | Internal inconsistency (bad cursor, missing skill, etc.) |
| `CORRUPTED_USER_STATS` | Missing stats during operation |
| `HEARTS_ALREADY_FULL` | Heart refill when already at max |
| `NOT_ENOUGH_GEMS` | Heart refill with insufficient gems (< 350) |
| `UNSUPPORTED_EXERCISE_TYPE` | Unknown exercise type in evaluator registry |

---

## 422 Unprocessable Entity

Raised by `InvalidPayloadError("REASON")`.

| Code | When |
|---|---|
| `INVALID_ANSWER_PAYLOAD` | Answer JSON shape does not match exercise type evaluator |

Also returned by FastAPI for malformed request bodies (wrong types, missing fields) without a custom code.

---

## Non-Error Success Semantics

These are **not** HTTP errors but are part of the answer contract:

| Condition | HTTP | Response flag |
|---|---|---|
| Wrong answer, hearts remain | 200 | `"correct": false`, `"lesson_failed": false` |
| Wrong answer, hearts hit zero | 200 | `"correct": false`, `"lesson_failed": true` |

---

## Frontend Mapping

`FRONTEND/src/lib/api-errors.ts` maps codes to user-facing strings. Covered codes:

`SKILL_LOCKED`, `LESSON_NOT_FOUND`, `ATTEMPT_NOT_FOUND`, `ATTEMPT_FORBIDDEN`, `ATTEMPT_ALREADY_TERMINATED`, `EXERCISE_NOT_CURRENT`, `EXERCISE_ALREADY_ANSWERED`, `EXERCISE_NOT_IN_LESSON`, `LESSON_INCOMPLETE`, `LESSON_HAS_NO_EXERCISES`, `HEARTS_ALREADY_FULL`, `NOT_ENOUGH_GEMS`, `INVALID_ANSWER_PAYLOAD`, `UNSUPPORTED_EXERCISE_TYPE`, `CORRUPTED_LESSON_STATE`, `CORRUPTED_USER_STATS`, `USER_NOT_FOUND`, `USER_STATS_NOT_FOUND`.

Network failures (`fetch` TypeError) map to: *"Cannot reach the server. Make sure the backend is running."*

---

## OpenAPI Note

Domain error codes are **not** declared per-route in `docs/openapi.json`. Clients must consult this document and `docs/api-contract.md`.

---

## Naming Convention

All domain codes are **UPPER_SNAKE_CASE** string literals passed to exception constructors. No lowercase variants, no mixed formats. Verified by codebase grep against `ConflictError`, `ForbiddenError`, `NotFoundError`, `InvalidPayloadError` call sites.
