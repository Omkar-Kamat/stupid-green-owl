# Architectural Decisions

## Abstractions Used

### Repository Layer
- **Classification**: `BUILD`
- **Concrete Problem**: Separates persistence queries (e.g., zip trees to avoid N+1 queries) from business logic, allowing testable services via fakes. Keeps SQL out of routes.
- **Why simpler alternative is insufficient**: Copy-pasting SQLAlchemy `selectinload` queries across endpoints violates DRY and mixes HTTP concerns with SQL.
- **Scope Impact**: Marginally increases file count, zero impact on DB structure, significantly reduces test fragility.

### Answer Evaluator Registry (Strategy Pattern)
- **Classification**: `BUILD`
- **Concrete Problem**: Validating exercise answers correctly based on exercise type without enormous `if/elif/else` blocks inside `LessonService`.
- **Why simpler alternative is insufficient**: A giant conditional block is rigid, untestable in isolation, and violates Open-Closed Principle.
- **Scope Impact**: 5 specific classes implementing a `Protocol`, mapped in a `dict`. Extremely lightweight and built for the 24h scope.

### Gamification Service Seam
- **Classification**: `BUILD`
- **Concrete Problem**: The `complete_lesson` function must update XP, streak, and unlock progress without becoming a monolithic 300-line method.
- **Why simpler alternative is insufficient**: A single method managing 4 separate domains (lessons, stats, streaks, skills) is unmaintainable.
- **Scope Impact**: Moving the logic into `GamificationService.handle_lesson_completed()`. Still a synchronous method call.

### Infinite Practice (Completed -> New Attempt)
- **Classification**: `BUILD`
- **Concrete Problem**: Users want to practice lessons they've already completed, or retry failed ones.
- **Why simpler alternative is insufficient**: Forbidding restarting restricts natural learning mechanics. Un-completing an old attempt ruins historical data.
- **Scope Impact**: The `LessonService.start_lesson` simply mints a *new* `in_progress` attempt if the existing attempt is `completed` or `failed`.

### Concurrency Recovery via IntegrityError Re-fetch
- **Classification**: `BUILD`
- **Concrete Problem**: Double-clicking "Start Lesson" creates a race condition attempting to insert two `in_progress` rows, triggering SQLite `IntegrityError` due to partial unique index.
- **Why simpler alternative is insufficient**: Returning 500 crashes the client. Returning 409 Conflict creates a poor UX requiring manual retry.
- **Scope Impact**: The Service catches `IntegrityError`, issues `db.rollback()`, and automatically re-queries to return the active attempt as a "Resume".

### 409 Conflict for LESSON_HAS_NO_EXERCISES
- **Classification**: `BUILD`
- **Concrete Problem**: A user attempts to start a lesson that has no exercises assigned.
- **Why simpler alternative is insufficient**: Returning 500 implies a transient crash. Returning 422 implies user input is flawed. The lesson exists (so not 404), but its internal integrity state conflicts with the action of "starting" it. 409 Conflict correctly expresses that the server state prohibits the operation.
- **Scope Impact**: The `LessonService` explicitly checks exercise count and raises a ConflictError.

## Deliberately NOT Built Capabilities

### Caching (Redis) for Path & Leaderboard
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Traffic volume for 24-hour demo user scope is low. SQLite querying `ORDER BY total_xp` is instantaneous for <100 seeded rows.
- **What it takes later**: Provision Redis. Store `total_xp` in a Redis Sorted Set updated inside `handle_lesson_completed`. Shift `/leaderboard` to query the sorted set instead of DB.

### Event Bus / Message Broker
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Three synchronous method calls for streak, XP, and skill unlocks are well within bounds for a single HTTP transaction and don't justify queuing infrastructure.
- **What it takes later**: Stand up RabbitMQ/Kafka. Refactor `GamificationService` to publish a `LessonCompletedEvent`. Create separate worker services subscribed to this topic to handle XP/streak independently.

### Distributed Locking / Row-level Locks
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Running on SQLite serialization (single file writer).
- **What it takes later**: Swapping to Postgres and appending `with_for_update()` on attempt fetching inside `complete_lesson` to handle race conditions across concurrent replica pods.

### Background Jobs
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Lazy heart regeneration on request is sufficient for now.
- **What it takes later**: Provision Celery or similar to aggressively push notifications or regenerate hearts server-side continuously.

### Horizontal Scaling
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Scope requires only a single backend deployment container.
- **What it takes later**: Remove local SQLite. Deploy Postgres on RDS. Deploy API behind an Application Load Balancer.

### API Versioning beyond `/api/v1`
- **Classification**: `DESIGN-ONLY`
- **Why not now**: Currently iterating on the first release.
- **What it takes later**: Introducing `/api/v2` namespace routes when structural schema changes occur to prevent breaking mobile client contracts.

## Feature 3C: Lesson Completion Design

### 1. Completion Eligibility & 2. Final Cursor Semantics
- **Decision**: A lesson attempt is eligible for completion only if `attempt.status == 'in_progress'` and `attempt.current_exercise_index == len(lesson.exercises)`.
- **Reasoning**: This strict cursor validation ensures users cannot bypass exercises. If the cursor is less than the total exercises, the system returns `409 Conflict (LESSON_INCOMPLETE)`.

### 3. XP Formula
- **Decision**: `xp_awarded = Skill.xp_reward_per_lesson`. There are no dynamic combo bonuses or multipliers for this scope.

### 4. Streak Rules & 5. Daily Goal Update
- **Decision**: All activity-day calculations use UTC for this assignment.
  - **Streak**: 
    - If `last_activity_date < today - 1 day`, reset `current_streak` to 1.
    - If `last_activity_date == today - 1 day`, increment `current_streak` by 1.
    - If `last_activity_date == today`, `current_streak` remains unchanged.
    - Always `longest_streak = max(longest_streak, current_streak)`.
  - **Daily XP**:
    - If `last_activity_date < today`, reset `daily_xp = xp_awarded`.
    - If `last_activity_date == today`, `daily_xp += xp_awarded`.
  - Finally, set `last_activity_date = today`.

### 6. Skill XP / Crown Rules & 7. Unlock Cascade
- **Decision**:
  - `SkillProgress.xp_earned += xp_awarded`.
  - `SkillProgress.lessons_completed_in_level += 1`.
  - If `lessons_completed_in_level >= Skill.lessons_per_level`, reset it to `0` and increment `crown_level += 1`.
  - **Unlock Cascade**: When a skill reaches `crown_level == 1` for the first time, its `status` becomes `completed`. The `ProgressService` must then query the next skill in the path (ordered by `unit.order_index`, then `skill.order_index`) and create its `SkillProgress` row with `status = 'available'` via `ProgressRepository.create_skill_progress()`.

### 8. Idempotency using xp_awarded & 9. Duplicate/Concurrent Completion
- **Decision**: `POST /complete` must be idempotent for **side effects** (XP awarded once, stored on `LessonAttempt.xp_awarded`). If the attempt is already completed, the handler returns the persisted `xp_awarded` and `crown_earned` without mutating stats again. **`total_xp` and `streak` in the response reflect the user's current `UserStats` at retry time**, not a frozen completion snapshot — document this for clients.
- **Concurrent completion**: Completion is transactionally atomic under SQLite's single-writer model; concurrent duplicate requests are not explicitly retried/reconciled at the application layer.

### 10. Transaction Boundary
- **Decision**: `LessonService.complete_lesson()` opens a single transaction. It delegates mutations to `GamificationService` (updates `UserStats`) and `ProgressService` (updates `SkillProgress` and cascades unlocks), then mutates `LessonAttempt`. `LessonAttempt.status = COMPLETED` and `xp_awarded` are persisted atomically in the same transaction. A single `db.commit()` is issued. If any service fails, a `db.rollback()` prevents partial state.

### 11. Completion Response DTO & 12. Error Taxonomy
- **DTO**: Returns `xp_awarded`, `total_xp`, `streak`, and `crown_earned` as defined in `api-contract.md`.
- **Errors**:
  - `409 Conflict`: `LESSON_INCOMPLETE` (not all exercises answered).
  - `409 Conflict`: `ATTEMPT_ALREADY_TERMINATED` (if `status == failed`, or completed but missing cached `xp_awarded`).
  - `404 Not Found`: `ATTEMPT_NOT_FOUND` (invalid attempt ID).

### 13. Required Repository Methods
- **LessonRepository**: `get_skill(id)`, `get_next_skill(current_skill_id)`.
- **ProgressRepository**: `get_skill_progress(user_id, skill_id)`, `create_skill_progress(progress)`.
- **UserStatsRepository**: `get_stats_by_user_id(user_id)`.
- **AttemptRepository**: `get_attempt_by_id(id)`.

### 14. Service Responsibilities and Boundaries
- **LessonService**: Validates attempt state, opens transaction, coordinates domain services, saves attempt state, and handles commits/rollbacks.
- **GamificationService**: owns gamification business rules and mutates UserStats within the caller-owned transaction. Ignorant of lessons or skills.
- **ProgressService**: Purely handles crown math, `SkillProgress` mutations, and traversing the tree for unlock cascades. Ignorant of XP rules.

### 15. Complete Test Matrix
- **Idempotency**: Retrying a completed attempt returns the same success DTO without side effects.
- **Incomplete**: Fails with `LESSON_INCOMPLETE` if `cursor < len(exercises)`.
- **Failed Attempt**: FAILED attempt -> complete -> 409 ATTEMPT_ALREADY_TERMINATED with zero gamification/progress side effects.
- **Streak Calculation**: Same day (no change), next day (+1), broken streak (reset to 1).
- **Crown Progression**: Correctly increments `lessons_completed_in_level` and triggers crown up.
- **Unlock Cascade**: Completing the last lesson of a skill unlocks the next skill. Completing the last skill of a unit unlocks the first skill of the next unit.
- **Transaction Rollback**: If an error is injected into `ProgressService`, `UserStats` and `LessonAttempt` rollbacks are verified.
