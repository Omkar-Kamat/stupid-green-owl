# Architecture

This document describes the **verified current architecture**, the **target architecture**, and the **gaps between them** for the Stupid Green Owl learning platform (24-hour assignment scope).

Sources of truth, in evaluation order:

1. `AGENTS.md` — project constraints
2. Verified implementation (`BACKEND/`, `FRONTEND/`)
3. `docs/database.md`, `docs/api-contract.md`, `docs/decisions.md`
4. `plan.md` — intended direction (must be verified against code)

---

## System Overview

A Duolingo-style language-learning demo with:

- **Backend**: FastAPI monolith, SQLite (Postgres-swappable), Alembic migrations
- **Frontend**: Next.js App Router (TypeScript), Tailwind, Framer Motion
- **Integration**: REST JSON over `/api/v1/*` plus unversioned `/health-check`

```text
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  UI Components → Feature state → lib/api-client.ts → HTTP       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ JSON
┌───────────────────────────────▼─────────────────────────────────┐
│                         BACKEND (FastAPI)                        │
│  Routes (HTTP) → Services (business rules) → Repos → SQLite     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verified Current Architecture (Backend)

### Layering — BUILD

| Layer | Location | Responsibility |
|---|---|---|
| Routes | `BACKEND/app/api/v1/routes/` | Parse HTTP, inject `user_id`, call service, return DTO |
| Services | `BACKEND/app/services/` | Business rules, state transitions, transaction commits |
| Repositories | `BACKEND/app/repositories/` | Persistence only; no business rules, no commits |
| ORM models | `BACKEND/app/models/domain.py` | Schema representation |
| DTOs | `BACKEND/app/schemas/` | API request/response shapes |

**Dependency direction (enforced):**

```text
Route → Service → Repository → Database
```

Cross-service calls are allowed (e.g. `LessonService` → `GamificationService`, `ProgressService`). Repositories never call services. Routes never call repositories directly.

### Modules — BUILD

| Module | Service | Repositories | Domain |
|---|---|---|---|
| Lessons & path | `LessonService` | `LessonRepository`, `AttemptRepository` | Path, start/resume, answer, complete |
| Gamification | `GamificationService` | (mutates `UserStats` in caller session) | Hearts, XP, streak, daily goal, refill |
| Progress | `ProgressService` | `ProgressRepository`, `LessonRepository` | Crowns, skill status, unlock cascade |
| Users | `UserService` | `UserRepository`, `UserStatsRepository` | Profile, stats, heart refill endpoint |
| Leaderboard | `LeaderboardService` | `LeaderboardRepository` | Ranked XP list |
| Answer evaluation | `evaluators.py` (`EVALUATORS` registry) | — | Per-exercise-type correctness |

### Authentication — BUILD (stub)

- `get_current_user` in `BACKEND/app/api/deps.py` returns `settings.DEFAULT_USER_ID` (default `1`).
- No JWT, session, or API key validation.
- All protected routes receive `user_id` via FastAPI dependency injection.
- Attempt ownership is checked in services (`attempt.user_id != user_id` → `403 ATTEMPT_FORBIDDEN`).

### Authorization — BUILD (resource-level)

- **Skill lock**: `LessonService.start_lesson` re-derives skill status server-side; locked skills → `403 SKILL_LOCKED`.
- **Attempt ownership**: answer and complete endpoints verify `attempt.user_id`.
- Frontend route visibility is **not** a security boundary.

### Transaction ownership — BUILD

Services own commits. Repositories expose `db` session but do not commit.

| Operation | Commit location | Atomic scope |
|---|---|---|
| Start new attempt | `lesson_service.py:start_lesson` | Insert `LessonAttempt` |
| Submit answer | `lesson_service.py:submit_answer` | `ExerciseAttempt` + heart loss + cursor |
| Complete lesson | `lesson_service.py:complete_lesson` | Attempt terminal state + `UserStats` + `SkillProgress` |
| Lazy heart regen (read) | `user_service.py:get_my_stats` | `UserStats.hearts` if regen occurred |
| Heart refill | `user_service.py:refill_hearts` | Gems deduction + hearts to max |

On failure, services call `db.rollback()` before re-raising or recovering.

### Error handling — BUILD

Domain exceptions in `BACKEND/app/core/exceptions.py` map to HTTP in `BACKEND/app/main.py`:

| Exception | HTTP | Body |
|---|---|---|
| `NotFoundError` | 404 | `{"detail": "{RESOURCE}_NOT_FOUND"}` |
| `ForbiddenError` | 403 | `{"detail": "<REASON>"}` |
| `ConflictError` | 409 | `{"detail": "<REASON>"}` |
| `InvalidPayloadError` | 422 | `{"detail": "<REASON>"}` |

Full code list: `docs/error-taxonomy.md`.

### Request lifecycle

1. FastAPI route validates payload shape (Pydantic).
2. `get_current_user` injects `user_id`.
3. Service method loads state via repositories.
4. Service applies business rules (evaluators, gamification, progress).
5. Service commits if mutating.
6. Route returns Pydantic response DTO.

### Important data flows

**Path load**

```text
GET /path → LessonService.get_path
  → LessonRepository.get_course_tree (selectinload, no N+1)
  → ProgressRepository.get_user_progress
  → merge skill status + crown_level into PathResponse
```

**Lesson start / resume**

```text
POST /lessons/{id}/start → LessonService.start_lesson
  → validate skill unlocked via _resolve_skill_status (targeted progress query)
  → GamificationService.regenerate_hearts (same as /me/stats)
  → AttemptRepository.get_active_attempt OR insert new LessonAttempt
  → IntegrityError recovery on concurrent start (partial unique index)
  → StartLessonResponse (exercises omit correct_answer)
```

**Answer submit**

```text
POST /lesson-attempts/{id}/answers → LessonService.submit_answer
  → validate attempt in_progress, exercise matches cursor
  → EVALUATORS[type].evaluate
  → if wrong: GamificationService.consume_heart; maybe mark attempt failed
  → if correct: advance cursor; partial unique index prevents duplicate correct row
  → AnswerResponse (includes correct_answer for feedback)
```

**Lesson complete**

```text
POST /lesson-attempts/{id}/complete → LessonService.complete_lesson
  → if already completed: return cached xp_awarded (no double XP)
  → validate cursor == len(exercises)
  → GamificationService.handle_lesson_completed (XP, streak, daily_xp)
  → ProgressService.handle_lesson_completed (crown, unlock cascade)
  → attempt.status = completed, xp_awarded set, single commit
```

### Lesson attempt state machine — BUILD

Each `LessonAttempt` row is **terminal** once `completed` or `failed`. Restarting or practicing creates a **new** row.

| Current state | Action | Next state | Allowed? | Notes |
|---|---|---|---|---|
| *(none)* | start | `in_progress` | YES | Insert new attempt |
| `in_progress` | start | `in_progress` | YES | Resume existing attempt |
| `completed` | start | `in_progress` | YES | **New** attempt row (practice) |
| `failed` | start | `in_progress` | YES | **New** attempt row (retry) |
| `in_progress` | answer (correct) | `in_progress` | YES | Cursor advances |
| `in_progress` | answer (wrong, hearts remain) | `in_progress` | YES | Cursor unchanged, heart −1 |
| `in_progress` | answer (wrong, hearts = 0) | `failed` | YES | HTTP 200, `lesson_failed: true` |
| `in_progress` | complete (cursor at end) | `completed` | YES | XP + progress in one transaction |
| `completed` / `failed` | answer / complete | — | NO | `409 ATTEMPT_ALREADY_TERMINATED` |

### Hearts — BUILD

| Field | Meaning |
|---|---|
| `UserStats.hearts` | Authoritative global balance |
| `UserStats.last_heart_lost_at` | Timer anchor for lazy regeneration |
| `LessonAttempt.hearts_lost` | Attempt-local mistake counter (audit) |
| `StartLessonResponse.hearts_remaining` | Snapshot of `UserStats.hearts` after lazy regen at start (same as `/me/stats`) |

**Regeneration**: lazy, on read. `GET /me/stats`, `start_lesson`, and `consume_heart` call `GamificationService.regenerate_hearts`. Interval: 4 hours per heart. **No background cron, worker, or scheduled task.**

**At zero hearts**: wrong answers return HTTP 200 with `lesson_failed: true`; no further heart deduction attempted.

### Concurrency — BUILD (partial)

| Scenario | Enforcement |
|---|---|
| Concurrent lesson start | Partial unique index on `(user_id, lesson_id) WHERE status='in_progress'` + IntegrityError recovery |
| Duplicate correct answer | Partial unique index on `(lesson_attempt_id, exercise_id) WHERE is_correct=true` |
| Concurrent lesson complete | Conditional `try_complete_attempt` + poll fallback for loser; threaded HTTP on SQLite remains environment-limited |

SQLite single-writer serializes commits but does not prevent read-modify-write races on completion.

---

## Verified Current Architecture (Frontend)

### Production learner journey — BUILD

```text
/learn/japanese → LearningPath (GET /path)
  → click skill → /lesson/{lessonId}  (lesson id from path API `lesson_id`)
  → ApiLessonPlayer
      → POST /lessons/{id}/start
      → POST /lesson-attempts/{id}/answers (loop)
      → POST /lesson-attempts/{id}/complete
  → UserStatsProvider.refresh() after mutations
```

### Prototype routes — BUILD (non-production)

`/lesson/{listening,translate,meaning}/{before,after}` use legacy `LessonPlayer` with local mock data and `localStorage` progress. **Not connected to the backend.** Yellow banner marks these routes.

### Frontend layering — BUILD

| Layer | Location | Responsibility |
|---|---|---|
| Pages | `FRONTEND/src/app/` | Route composition |
| Components | `FRONTEND/src/components/` | Presentation + local UI state |
| API client | `FRONTEND/src/lib/api-client.ts`, `lib/api/` | HTTP, types, error parsing |
| Server state | `UserStatsProvider` + per-feature `useState`/`useEffect` | Fetches `/me/stats`; no TanStack Query |
| Demo auth | `lib/demoAuth.ts` | Writes `localStorage` session; **not sent to API** |

### Server-authoritative state — BUILD (intended)

Hearts, gems, XP, streak, path lock status, and lesson progression are **never** computed authoritatively on the client in the production path. The client sends only `exercise_id` + `answer`.

---

## Target Architecture

The target architecture matches the current BUILD design. Remaining optional improvements before a production hardening pass:

### Backend (optional)

- Postgres deployment with row-level locking for true concurrent completion under load.
- Expose `daily_xp` in `UserStatsResponse` if daily-quest UI ships.

### Frontend (optional)

- TanStack Query for server-state caching (plan.md mentions it; demo uses `useState`/`UserStatsProvider`).
- Playwright e2e for path → lesson → complete → refresh (stretch in plan.md §11).

### Resolved (verified in code/tests)

- Explicit DTO mapping in user routes
- Completion idempotency under concurrency (`try_complete_attempt` + poll)
- Targeted skill-lock lookup in `start_lesson`
- Heart regen on lesson start aligned with `/me/stats`
- Postgres-portable IntegrityError handling
- `gems >= 0` DB CHECK
- Right panels wired to `UserStatsProvider`
- Skill → lesson routing via path `lesson_id`
- Stats error/retry UI
- Answer validation before submit
- Vitest + RTL baseline (exercise components, reducer, path nodes, lesson player)
- Alembic in test setup
- `.env.local.example`

---

## Known Implementation Gaps (Verified)

| ID | Severity | Area | Current | Target |
|---|---|---|---|---|
| G1 | P2 | Auth | Mock `DEFAULT_USER_ID=1` | Real auth (out of demo scope) |
| G2 | P2 | Tests | No Playwright e2e | Stretch: path → lesson → complete → refresh |
| G3 | P2 | API | `daily_xp` not in stats DTO | Expose if daily-quest UI ships |
| G4 | P2 | Frontend | TanStack Query not wired | Optional server-state cache per plan.md |
| G5 | P2 | Concurrency | SQLite single-writer limits threaded HTTP races | Postgres + row lock for production |

---

## Intentionally NOT Abstracted — BUILD

- Direct service calls instead of event bus (`GamificationService` called synchronously from `LessonService`).
- No generic `BaseRepository[T]` — explicit query methods per aggregate.
- Manual DTO mapping (no auto-mapper framework).
- Fake auth via `DEFAULT_USER_ID` dependency (single swap point for real auth).

## Intentionally NOT Built — DESIGN-ONLY

See `docs/decisions.md` for full rationale:

- Redis / leaderboard cache
- Message broker / event bus
- Background workers / cron for heart regen
- Horizontal scaling / load balancer
- Read replicas
- Distributed locking (beyond SQLite/Postgres row locks)
- Rate limiting middleware
- CDN for audio assets
- Real authentication, payments, speech recognition

**DO NOT IMPLEMENT IN CURRENT SCOPE.**

---

## Exercise Data Contracts — BUILD

Authoritative shapes as seeded and rendered (`BACKEND/seed.py`, `BackendExerciseView.tsx`):

| Type | `Exercise.data` | `Exercise.correct_answer` | Client `answer` |
|---|---|---|---|
| `multiple_choice` | `{"options": ["あ", ...]}` | `"あ"` | `"あ"` |
| `translate` | `{"word_bank": ["ありがとう", ...]}` | `["ありがとう"]` | `["ありがとう"]` |
| `fill_blank` | `{"sentence": "あ_がとう", "options": ["り", ...]}` | `["り"]` | `["り"]` |
| `match_pairs` | `{"pairs": [{"id":"p1","left":"Hello"}], "right_options": [{"id":"r1","right":"こんにちは"}]}` | `{"p1":"r1", ...}` | `{"p1":"r1", ...}` |
| `type_answer` | `{"placeholder": "Type in romaji or kana"}` | `["a", "あ"]` (accepted variants) | `"a"` |

Evaluators live in `BACKEND/app/services/evaluators.py`. Malformed **client** payloads → `422 INVALID_ANSWER_PAYLOAD`. Malformed **seed** data in `type_answer` currently returns incorrect (should raise `CORRUPTED_LESSON_STATE` — target fix).

---

## End-to-End Flow Trace (Golden Path)

```text
User clicks Hiragana on /learn/japanese
  → GET /path (skill 1 available, lesson_id from API)
  → navigate /lesson/{lesson_id}
  → POST /lessons/{id}/start
  → POST /lesson-attempts/{id}/answers × N
  → POST /lesson-attempts/{id}/complete
  → GET /path (skill 1 completed, skill 2 available)
  → GET /me/stats (xp increased)
```

Verified by `BACKEND/scripts/smoke_test.py`, `BACKEND/scripts/verify_fresh_install.sh`, and pytest QA suites.

---

## Architecture Status

**Demo-ready.** Core invariants, API contracts, frontend integration, and test coverage align for assignment submission.

Remaining optional hardening (not blocking demo):

- Real authentication (mock `DEFAULT_USER_ID=1` today)
- Playwright e2e stretch test (plan.md §11)
- Postgres deployment for true threaded HTTP concurrency
- TanStack Query for server-state caching (plan.md mentions; demo uses `UserStatsProvider`)
