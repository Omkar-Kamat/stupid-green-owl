# Database Design

This document describes the **verified schema** as implemented in `BACKEND/app/models/domain.py` and the Alembic migration chain. All tables are **BUILD** for the 24-hour scope.

Database engine: **SQLite** by default (`duolingo.db`), swappable to Postgres via `DATABASE_URL`.

---

## Entity Relationship

```text
Course ──< Unit ──< Skill ──< Lesson ──< Exercise

User ──< UserStats          (1:1)
User ──< SkillProgress >── Skill
User ──< LessonAttempt >── Lesson
LessonAttempt ──< ExerciseAttempt >── Exercise
```

Seed data: Japanese course, 2 units, 4 skills, 4 lessons (1 per skill), 43 exercises total.

---

## Tables

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `username` | VARCHAR | UNIQUE, NOT NULL |
| `email` | VARCHAR | NULLABLE |
| `avatar_url` | VARCHAR | NULLABLE |
| `created_at` | DATETIME | NOT NULL, default UTC now |

### `user_stats`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → `users.id`, UNIQUE, NOT NULL |
| `total_xp` | INTEGER | NOT NULL, default 0 |
| `current_streak` | INTEGER | NOT NULL, default 0 |
| `longest_streak` | INTEGER | NOT NULL, default 0 |
| `hearts` | INTEGER | NOT NULL, default 5 |
| `max_hearts` | INTEGER | NOT NULL, default 5 |
| `gems` | INTEGER | NOT NULL, default 500 |
| `daily_xp` | INTEGER | NOT NULL, default 0 |
| `daily_goal` | INTEGER | NOT NULL, default 30 |
| `last_activity_date` | DATE | NULLABLE |
| `last_heart_lost_at` | DATETIME | NULLABLE |
| `updated_at` | DATETIME | NOT NULL, on update |

**CHECK constraints (migration `05a520883702`):**

- `chk_total_xp_positive`: `total_xp >= 0`
- `chk_hearts_bound`: `hearts >= 0 AND hearts <= max_hearts`
- `chk_gems_positive`: `gems >= 0` (migration `d5e6f7a8b9c0`)

### `courses`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `name` | VARCHAR | NOT NULL |
| `source_language` | VARCHAR | NOT NULL |
| `target_language` | VARCHAR | NOT NULL |

### `units`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `course_id` | INTEGER | FK → `courses.id`, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `order_index` | INTEGER | NOT NULL |
| `color_theme` | VARCHAR | NOT NULL |

### `skills`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `unit_id` | INTEGER | FK → `units.id`, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `icon` | VARCHAR | NOT NULL |
| `order_index` | INTEGER | NOT NULL |
| `xp_reward_per_lesson` | INTEGER | NOT NULL, default 10 |
| `lessons_per_level` | INTEGER | NOT NULL, default 1 |

**Index:** `idx_skills_unit_id_order_index` on `(unit_id, order_index)` — path tree assembly.

### `lessons`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `skill_id` | INTEGER | FK → `skills.id`, NOT NULL |
| `order_index` | INTEGER | NOT NULL |

**Note:** Seed creates exactly one lesson per skill. Skill id and lesson id may coincide on fresh seed auto-increment — this is **not** a schema guarantee. The path API exposes `lesson_id` per skill; the frontend routes via that field (see `docs/api-contract.md`).

### `exercises`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `lesson_id` | INTEGER | FK → `lessons.id`, NOT NULL |
| `order_index` | INTEGER | NOT NULL |
| `type` | ENUM | `multiple_choice`, `translate`, `match_pairs`, `fill_blank`, `type_answer` |
| `prompt` | VARCHAR | NOT NULL |
| `data` | JSON | NOT NULL — presentation payload (no answers) |
| `correct_answer` | JSON | NOT NULL — authoritative grading key |

**Index:** `idx_exercises_lesson_id_order_index` on `(lesson_id, order_index)` — ordered lesson load.

### `skill_progress`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → `users.id`, NOT NULL |
| `skill_id` | INTEGER | FK → `skills.id`, NOT NULL |
| `status` | ENUM | `locked`, `available`, `completed` |
| `crown_level` | INTEGER | NOT NULL, default 0 |
| `lessons_completed_in_level` | INTEGER | NOT NULL, default 0 |
| `xp_earned` | INTEGER | NOT NULL, default 0 |
| `updated_at` | DATETIME | NOT NULL |

**UNIQUE:** `(user_id, skill_id)` — one progress row per learner per skill.

**CHECK constraints (migration `b429ad793460`):**

- `crown_level >= 0`
- `lessons_completed_in_level >= 0`
- `xp_earned >= 0`

### `lesson_attempts`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → `users.id`, NOT NULL |
| `lesson_id` | INTEGER | FK → `lessons.id`, NOT NULL |
| `status` | ENUM | `in_progress`, `completed`, `failed` |
| `current_exercise_index` | INTEGER | NOT NULL, default 0 |
| `hearts_lost` | INTEGER | NOT NULL, default 0 |
| `xp_awarded` | INTEGER | NULLABLE — set once on completion |
| `crown_earned` | BOOLEAN | NOT NULL, default false |
| `started_at` | DATETIME | NOT NULL |
| `completed_at` | DATETIME | NULLABLE |

**State semantics:**

- Terminal states: `completed`, `failed` — rows are never mutated back to `in_progress`.
- Practice/retry creates a **new** row.
- `current_exercise_index` is zero-based; points to the next exercise to answer. Equals `len(exercises)` when all answered correctly.

**Partial unique index (migration `05a520883702`):**

```sql
CREATE UNIQUE INDEX idx_one_active_attempt_per_lesson
ON lesson_attempts (user_id, lesson_id)
WHERE status = 'in_progress';
```

**WHY:** Enforces at most one active session per (user, lesson) at the DB level (`AGENTS.md` rule 8).

**Index:** `idx_lesson_attempts_resume` on `(user_id, lesson_id, status)` — resume lookup.

**CHECK constraints (migration `b429ad793460`):**

- `current_exercise_index >= 0`
- `hearts_lost >= 0`
- `xp_awarded >= 0` (when not null)

### `exercise_attempts`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `lesson_attempt_id` | INTEGER | FK → `lesson_attempts.id`, NOT NULL |
| `exercise_id` | INTEGER | FK → `exercises.id`, NOT NULL |
| `user_answer` | JSON | NOT NULL |
| `is_correct` | BOOLEAN | NOT NULL |
| `answered_at` | DATETIME | NOT NULL |

**Partial unique index (migration `364dce73abf6`):**

```sql
CREATE UNIQUE INDEX idx_unique_correct_attempt
ON exercise_attempts (lesson_attempt_id, exercise_id)
WHERE is_correct = true;
```

**WHY:** Prevents duplicate **correct** submissions for the same exercise in one attempt. Wrong answers may be retried (cursor does not advance).

---

## Constraints & Indexes Summary

| Constraint / Index | WHY |
|---|---|
| `user_stats.total_xp >= 0` | Sanity net; XP only increases |
| `user_stats.hearts` bounded | Prevents negative or over-max hearts |
| `UNIQUE (user_id, skill_id)` on skill_progress | Safe upsert; one row per skill |
| Partial unique active attempt | Concurrent start safety |
| Partial unique correct attempt | Duplicate correct-answer safety |
| `exercises(lesson_id, order_index)` | Ordered exercise fetch every lesson |
| `skills(unit_id, order_index)` | Path assembly every `/path` request |
| `lesson_attempts(user_id, lesson_id, status)` | Resume-attempt lookup |

---

## Completion Eligibility (Application Logic)

**Current implementation:** `complete_lesson` requires both:

1. `current_exercise_index >= len(lesson.exercises)`
2. `count_exercise_attempts(attempt_id) >= len(lesson.exercises)`

Cursor-only bypass without persisted `ExerciseAttempt` rows is rejected with `LESSON_INCOMPLETE`.

---

## Transaction Requirements — BUILD

| Operation | Tables touched | Requirement |
|---|---|---|
| Complete lesson | `lesson_attempts`, `user_stats`, `skill_progress` | Single `db.commit()` in `LessonService.complete_lesson` |
| Submit answer | `exercise_attempts`, `lesson_attempts`, `user_stats` | Single commit in `submit_answer` |
| Start lesson | `lesson_attempts` | Single commit on insert |

On any exception, `db.rollback()` before recovery or re-raise.

---

## Deletion / Cascade Behavior

No cascading deletes modeled. User deletion is out of scope. FK relationships exist but orphan cleanup is not implemented.

---

## Migrations — BUILD

Managed by Alembic. **Production and fresh install use `alembic upgrade head`.**

| Revision | Summary |
|---|---|
| `05a520883702` | Initial schema — all tables, enums, core indexes, partial unique active attempt |
| `b429ad793460` | CHECK constraints on `lesson_attempts`, `skill_progress` |
| `364dce73abf6` | Partial unique index on correct `exercise_attempts` |
| `1134fcb0aa41` | Add nullable `crown_earned` to `lesson_attempts` |
| `c4a8e1f02b3d` | Backfill + NOT NULL `crown_earned` |
| `d5e6f7a8b9c0` | `CHECK (gems >= 0)` on `user_stats` |

**Head:** `d5e6f7a8b9c0`

**Tests:** `BACKEND/tests/conftest.py` runs `alembic upgrade head` on an in-memory SQLite database before each test (drops `alembic_version` between runs so migrations re-apply). Migration-only constraints (e.g. gems CHECK) are exercised in `test_database_invariants.py`.

---

## Seed Strategy — BUILD

`BACKEND/seed.py` performs a **full deterministic reset**: deletes all content and user progress, recreates course + demo users.

- Demo learner: `user_id=1`, username `demo_learner`
- Lesson 1 (Hiragana): all 5 exercise types, 10 exercises
- 43 exercises across 4 lessons

Re-running seed is safe and idempotent in the sense of producing identical content state.

---

## DESIGN-ONLY

| Capability | Why not now |
|---|---|
| Redis cache for leaderboard/path | <100 seeded rows; SQLite sufficient |
| Postgres `SELECT … FOR UPDATE` | Single-process SQLite demo |
| Read replicas | No read scaling need |
| Full-text search on exercises | Not in scope |
