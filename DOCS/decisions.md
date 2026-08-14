# Architectural Decisions

Recorded decisions for the Stupid Green Owl demo platform. Each entry includes classification (`BUILD` or `DESIGN-ONLY`), the concrete problem solved, and scope impact.

Cross-references: `docs/architecture.md`, `docs/database.md`, `docs/api-contract.md`, `AGENTS.md`.

---

## BUILD Decisions

### Layered backend (Route → Service → Repository)

- **Problem:** Business rules mixed with HTTP and SQL become untestable and leak across features.
- **Alternative considered:** Fat controllers with inline SQLAlchemy.
- **Why insufficient:** Violates `AGENTS.md`; every feature change touches HTTP layer.
- **Impact:** ~6 route files, 5 services, 6 repositories. Clear ownership.

### Fake auth via `get_current_user` dependency

- **Problem:** Need end-to-end flows without building real auth in 24 hours.
- **Alternative considered:** No auth at all (no user_id in services).
- **Why insufficient:** Services would lack explicit user context; real auth swap would touch every signature.
- **Impact:** Single dependency to replace. All services take `user_id: int`. Attempt ownership checks already in place.

### Server-authoritative gamification

- **Problem:** Client could spoof XP, hearts, streak, unlock state.
- **Decision:** Backend computes and persists all progression. Client sends only answers.
- **Impact:** `GamificationService`, `ProgressService`, DB CHECK constraints on hearts/XP.

### Partial unique index — one active attempt per (user, lesson)

- **Problem:** Concurrent "Start lesson" could create duplicate `in_progress` rows.
- **Alternative considered:** App-level check only.
- **Why insufficient:** Race between check and insert (`AGENTS.md` rule 8).
- **Impact:** DB-enforced invariant + IntegrityError recovery in `LessonService.start_lesson`.

### Terminal attempt states + new row on practice/retry

- **Problem:** Users need to practice completed lessons or retry failed ones without corrupting history.
- **Alternative considered:** Mutate completed attempt back to `in_progress`.
- **Why insufficient:** Loses completion audit trail; breaks idempotent `xp_awarded`.
- **Impact:** `completed`/`failed` rows immutable; `start_lesson` inserts new row when no active attempt exists.

### IntegrityError recovery on concurrent start

- **Problem:** Second concurrent start hits partial unique index → SQLite error.
- **Alternative considered:** Return 409 to client.
- **Why insufficient:** Poor UX on double-click; client must manual retry.
- **Impact:** Service catches error, rolls back, re-fetches active attempt, returns resume response.

### Answer evaluator registry (Strategy pattern)

- **Problem:** Five exercise types with different validation/compare logic.
- **Alternative considered:** Giant if/elif in `submit_answer`.
- **Why insufficient:** Untestable, violates Open-Closed.
- **Impact:** 5 small evaluator classes + `EVALUATORS` dict. Lightweight for scope.

### Lazy heart regeneration (no cron)

- **Problem:** Hearts should refill over time without background infrastructure.
- **Decision:** Regenerate on read (`GET /me/stats`) and before consumption (`consume_heart`). 4-hour interval per heart.
- **Alternative considered:** Celery/cron worker.
- **Why insufficient:** Over-engineering for demo (`AGENTS.md` rule 10).
- **Impact:** `GamificationService.regenerate_hearts`. Side-effecting GET on stats (documented).

### Zero hearts → lesson failed (HTTP 200, not 403)

- **Problem:** Wrong answer when hearts = 0 should end the attempt gracefully.
- **Decision:** Return 200 with `lesson_failed: true`; do not attempt further heart deduction.
- **Alternative considered:** 403 on heart consumption.
- **Why rejected:** Client already in answer flow; 200 with flag matches Duolingo-style UX.
- **Impact:** Documented in `docs/api-contract.md` and invariant §18.

### Completion idempotency via `xp_awarded`

- **Problem:** Network retry on complete must not double-award XP.
- **Decision:** If `attempt.status == completed` and `xp_awarded` set, return cached values without mutating stats.
- **Gap:** Concurrent in-flight completes not fully guarded — target fix uses conditional update or lock (see below).

### Single transaction on lesson complete

- **Problem:** Partial completion could leave XP awarded but attempt still in progress.
- **Decision:** `LessonService.complete_lesson` — one `db.commit()` for attempt + stats + progress.
- **Impact:** Rollback test in `test_lesson_completion.py`.

### Deterministic seed reset

- **Problem:** "Idempotent" partial seed left stale progress and confused demo state.
- **Decision:** `seed.py` wipes content + users, recreates from scratch.
- **Impact:** Predictable smoke test and fresh-install verification.

### Canonical docs at `docs/` (lowercase)

- **Problem:** Duplicate `DOCS/` and `docs/` trees caused drift.
- **Decision:** Single canonical tree at `docs/`. OpenAPI at `docs/openapi.json`.

### Frontend: dual lesson players

- **Problem:** Early UI prototypes exist alongside API-driven player.
- **Decision:** Production path uses `ApiLessonPlayer` on `/lesson/[lessonId]`. Prototype routes retained with banner.
- **Impact:** Legacy `LessonPlayer` + `localStorage` progress isolated to demo routes.

### SQLite for demo, Postgres-swappable

- **Problem:** Assignment requires persistence; production would use Postgres.
- **Decision:** `DATABASE_URL` env var; no SQLite-specific SQL in queries.
- **Gap:** IntegrityError string matching is SQLite-specific today — target: portable constraint detection.

---

## DESIGN-ONLY Decisions

### Redis / leaderboard cache

- **Why not now:** Seeded leaderboard <100 rows; SQLite sort is instant.
- **What it takes later:** Redis sorted set updated in `handle_lesson_completed`; `/leaderboard` reads from cache.

### Event bus / message broker

- **Why not now:** Synchronous service calls fit in one HTTP transaction.
- **What it takes later:** Publish `LessonCompletedEvent`; worker services for XP/streak/achievements.

### Background jobs for heart regeneration

- **Why not now:** Lazy on-read regeneration is sufficient for demo.
- **What it takes later:** Scheduled worker calling regen for active users; optional push notifications.

### Distributed locking / `SELECT FOR UPDATE`

- **Why not now:** Single-process SQLite demo.
- **What it takes later:** Postgres + row locks on attempt fetch in `complete_lesson` for multi-instance API.

### Horizontal scaling / load balancer

- **Why not now:** Single container deployment.
- **What it takes later:** Postgres, stateless API replicas, shared DB, sticky sessions or JWT auth.

### Rate limiting

- **Why not now:** Single demo user, local deployment.
- **What it takes later:** Middleware (e.g. slowapi) on mutation endpoints.

### Real authentication

- **Why not now:** Explicitly stubbed in assignment scope.
- **What it takes later:** Replace `get_current_user` with JWT/session validation; multi-user isolation tests.

### TanStack Query on frontend

- **Why not now:** `useState`/`useEffect` sufficient for demo; added dependency cost.
- **What it takes later:** Centralized cache, deduped fetches, mutation invalidation — reduces duplicate `/me/stats` calls.

### API v2 namespace

- **Why not now:** First release; breaking changes acceptable in demo.
- **What it takes later:** `/api/v2` when mobile clients need stable contracts.

### CDN / object storage for audio

- **Why not now:** Type-answer exercises use text prompts only.
- **What it takes later:** S3 + signed URLs for listening exercises.

---

## Feature Decisions (Lesson Completion)

### Completion eligibility

- **Decision:** `attempt.status == in_progress` AND `current_exercise_index == len(exercises)`.
- **Reasoning:** Cursor only advances on correct answers; index at length means all exercises passed.

### XP formula

- **Decision:** `xp_awarded = Skill.xp_reward_per_lesson` (default 10 in seed). No combo multipliers.

### Streak rules (UTC)

| Condition | Effect |
|---|---|
| First activity ever | `current_streak = 1` |
| `last_activity_date == yesterday` | `current_streak += 1` |
| `last_activity_date == today` | streak unchanged |
| Gap ≥ 2 days | `current_streak = 1` |
| Always | `longest_streak = max(longest_streak, current_streak)` |

### Daily XP

| Condition | Effect |
|---|---|
| `last_activity_date < today` | `daily_xp = xp_awarded` |
| Same day | `daily_xp += xp_awarded` |

### Crown and unlock cascade

1. `SkillProgress.xp_earned += xp_awarded`
2. `lessons_completed_in_level += 1`
3. If `lessons_completed_in_level >= skill.lessons_per_level`: reset counter, `crown_level += 1`
4. When `crown_level == 1`: `status = completed`, unlock next skill via `get_next_skill` (same unit, then cross-unit)

### Completion response semantics

- `xp_awarded`, `crown_earned`: cached from attempt on retry.
- `total_xp`, `streak`: live from `UserStats` on every response.

### Concurrent completion (known limitation)

- **Current:** SQLite serializes writes; sequential retry idempotency works.
- **Target:** Application-level guard (conditional update) + concurrent test.
- **Documented in:** `BACKEND/README.md` Known Limitations, `docs/architecture.md` G2.

---

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Generic repository-of-repositories | `AGENTS.md` rule 9 — unnecessary abstraction |
| Redis in demo | `AGENTS.md` rule 10 — design-only |
| Client-side heart tracking in production | Violates server authority |
| Mutating completed attempts for practice | Breaks audit trail and idempotency |
| 403 when hearts hit zero mid-lesson | Worse UX than 200 + `lesson_failed` |

---

## Test Matrix (Required vs Verified)

| Case | Required | Verified test |
|---|---|---|
| Sequential completion idempotency | Yes | `test_idempotent_retry` |
| Concurrent completion idempotency | Yes | **Missing** |
| Incomplete lesson → 409 | Yes | `test_incomplete_lesson` |
| Failed attempt → complete 409 | Yes | `test_failed_attempt` |
| Streak same/next/broken day | Yes | `test_same_day_streak`, `test_broken_streak` |
| Same-unit unlock cascade | Yes | `test_successful_completion_and_crown_cascade` |
| Cross-unit unlock cascade | Yes | **Missing** |
| Completion transaction rollback | Yes | `test_completion_transaction_rollback_on_failure` |
| Wrong answer hearts −1, cursor unchanged | Yes | `test_answers.py`, smoke test |
| Heart regen capped at max | Yes | `test_heart_regeneration.py` |
| Partial unique active attempt | Yes | `test_database_invariants.py` |

---

## Current-State Problems → Target (Summary)

All items below were resolved in the current codebase. Kept for audit trail.

| Problem | Resolution |
|---|---|
| User routes return ORM | `UserService` returns explicit DTOs |
| Concurrent double XP | `try_complete_attempt` + poll fallback + tests |
| Frontend hardcoded stats | `UserStatsProvider` wired across panels |
| Skill id = lesson id assumption | Path API `lesson_id`; frontend routes via it |
| Tests use `create_all()` | Alembic `upgrade head` in `conftest.py` |
| No frontend tests | Vitest + RTL (26 tests) |

**Architecture status:** Demo-ready. Optional: real auth, Playwright e2e, Postgres concurrency.
