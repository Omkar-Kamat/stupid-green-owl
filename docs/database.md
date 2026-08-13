# Database Design

## Tables & Entities

All database entities are marked as **BUILD** for the 24-hour scope unless explicitly marked otherwise. They are implemented using SQLAlchemy 2.0 with SQLite (swappable to Postgres via `DATABASE_URL`).

### `users`
- `id`: INT, PK
- `username`: VARCHAR, UNIQUE, NOT NULL
- `email`: VARCHAR, NULLABLE
- `avatar_url`: VARCHAR, NULLABLE
- `created_at`: DATETIME, NOT NULL, DEFAULT `utcnow()`

### `user_stats`
- `id`: INT, PK
- `user_id`: INT, FK(`users.id`), UNIQUE, NOT NULL
- `total_xp`: INT, NOT NULL, DEFAULT 0. **CHECK**: `total_xp >= 0`
- `current_streak`: INT, NOT NULL, DEFAULT 0
- `longest_streak`: INT, NOT NULL, DEFAULT 0
- `hearts`: INT, NOT NULL, DEFAULT 5. **CHECK**: `hearts >= 0 AND hearts <= max_hearts`
- `max_hearts`: INT, NOT NULL, DEFAULT 5
- `gems`: INT, NOT NULL, DEFAULT 500
- `daily_xp`: INT, NOT NULL, DEFAULT 0
- `daily_goal`: INT, NOT NULL, DEFAULT 30
- `last_activity_date`: DATE, NULLABLE
- `last_heart_lost_at`: DATETIME, NULLABLE
- `updated_at`: DATETIME, NOT NULL, DEFAULT `utcnow()`
- **Relationships**: 1:1 with `users`.

### `courses`
- `id`: INT, PK
- `name`: VARCHAR, NOT NULL
- `source_language`: VARCHAR, NOT NULL
- `target_language`: VARCHAR, NOT NULL

### `units`
- `id`: INT, PK
- `course_id`: INT, FK(`courses.id`), NOT NULL
- `title`: VARCHAR, NOT NULL
- `order_index`: INT, NOT NULL
- `color_theme`: VARCHAR, NOT NULL

### `skills`
- `id`: INT, PK
- `unit_id`: INT, FK(`units.id`), NOT NULL
- `title`: VARCHAR, NOT NULL
- `icon`: VARCHAR, NOT NULL
- `order_index`: INT, NOT NULL
- `xp_reward_per_lesson`: INT, NOT NULL, DEFAULT 10
- `lessons_per_level`: INT, NOT NULL, DEFAULT 1

### `lessons`
- `id`: INT, PK
- `skill_id`: INT, FK(`skills.id`), NOT NULL
- `order_index`: INT, NOT NULL

### `exercises`
- `id`: INT, PK
- `lesson_id`: INT, FK(`lessons.id`), NOT NULL
- `order_index`: INT, NOT NULL
- `type`: ENUM('multiple_choice', 'translate', 'match_pairs', 'fill_blank', 'type_answer'), NOT NULL
- `prompt`: VARCHAR, NOT NULL
- `data`: JSON, NOT NULL
- `correct_answer`: JSON, NOT NULL

### `skill_progress`
- `id`: INT, PK
- `user_id`: INT, FK(`users.id`), NOT NULL
- `skill_id`: INT, FK(`skills.id`), NOT NULL
- `status`: ENUM('locked', 'available', 'completed'), NOT NULL
- `crown_level`: INT, NOT NULL, DEFAULT 0
- `lessons_completed_in_level`: INT, NOT NULL, DEFAULT 0
- `xp_earned`: INT, NOT NULL, DEFAULT 0
- `updated_at`: DATETIME, NOT NULL, DEFAULT `utcnow()`
- **UNIQUE**: `(user_id, skill_id)`

### `lesson_attempts`
- `id`: INT, PK
- `user_id`: INT, FK(`users.id`), NOT NULL
- `lesson_id`: INT, FK(`lessons.id`), NOT NULL
- `status`: ENUM('in_progress', 'completed', 'failed'), NOT NULL. (Initial: `in_progress`. Terminal: `completed`, `failed`. Completed/Failed states are final. Restarting creates a new attempt).
- `current_exercise_index`: INT, NOT NULL, DEFAULT 0. A zero-based index pointing to the *next* exercise. Incremented only upon a correct answer. When the final exercise is answered correctly, it increments to `len(exercises)`.
- `hearts_lost`: INT, NOT NULL, DEFAULT 0. (Attempt-local state tracking mistakes during this specific session. The global authoritative balance is `UserStats.hearts`).
- `xp_awarded`: INT, NULLABLE
- `crown_earned`: BOOLEAN, NOT NULL, DEFAULT FALSE
- `started_at`: DATETIME, NOT NULL, DEFAULT `utcnow()`
- `completed_at`: DATETIME, NULLABLE

### `exercise_attempts`
- `id`: INT, PK
- `lesson_attempt_id`: INT, FK(`lesson_attempts.id`), NOT NULL
- `exercise_id`: INT, FK(`exercises.id`), NOT NULL
- `user_answer`: JSON, NOT NULL
- `is_correct`: BOOLEAN, NOT NULL
- `answered_at`: DATETIME, NOT NULL, DEFAULT `utcnow()`

---

## Constraints & Indexes (and WHY)

**BUILD**
- **CHECK constraint `total_xp >= 0`**: Sanity net. XP is only ever added. Prevents logic bugs from corrupting XP state.
- **CHECK constraint `hearts >= 0 AND hearts <= max_hearts`**: Critical invariant ensuring users cannot have negative hearts or more than the max via race conditions.
- **UNIQUE `(user_id, skill_id)` on `skill_progress`**: Ensures one progress tracking row per user per skill, making upserts safe.
- **Partial Unique Index `ON lesson_attempts(user_id, lesson_id) WHERE status = 'in_progress'`**: Enforces the "one active attempt" invariant natively in the DB, preventing duplicate session creation if the API receives concurrent `start_lesson` calls.
- **Partial Unique Index `ON exercise_attempts(lesson_attempt_id, exercise_id) WHERE is_correct = True`**: Prevents a user from answering the same exercise correctly multiple times in one attempt.
- **INDEX on `exercises(lesson_id, order_index)`**: `GET /lessons/{id}` strictly requires ordered exercises on every request.
- **INDEX on `skills(unit_id, order_index)`**: Required for efficient tree assembly (`Course -> Unit -> Skill`) on path screens.
- **INDEX on `lesson_attempts(user_id, lesson_id, status)`**: Needed to efficiently resume attempts when a user clicks a skill.

**DESIGN-ONLY**
- **Redis cache layer for `user_stats`**: Out of scope. Future architecture for leaderboards would rely on Redis sorted sets to avoid DB scans.
- **Postgres row-level locks (`SELECT ... FOR UPDATE`)**: For handling multi-node concurrent writes. Currently using SQLite file-level serialization.

## Deletion/Update Behavior
- No cascading deletes are required for the scope. User deletion is not modeled.
- `updated_at` triggers are handled via SQLAlchemy `onupdate=func.now()`.

## Transaction Requirements
**BUILD**
- Lesson completion mandates that `lesson_attempts`, `user_stats`, and `skill_progress` are committed in a single transaction by `LessonService`. 

## Migrations
**BUILD**
- Alembic manages schema. No `metadata.create_all()`.
