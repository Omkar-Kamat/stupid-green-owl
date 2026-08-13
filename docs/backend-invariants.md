# Backend System Invariants

This document outlines the core cross-feature invariants that must hold true at all times in the backend system. Each invariant is enforced through a combination of database constraints, service-level business logic, and automated tests.

## 1. Core State Invariants

### 1. UserStats.hearts >= 0
- **DB constraint**: `CHECK (hearts >= 0)` on `user_stats` table
- **Service check**: Refuse to deduct hearts if current `hearts == 0` (return 403)
- **Test**: `test_hearts_cannot_be_negative`

### 2. UserStats.hearts <= max_hearts
- **DB constraint**: `CHECK (hearts <= max_hearts)` on `user_stats` table
- **Service check**: Heart refill and regeneration logic must explicitly cap at `max_hearts`
- **Test**: `test_hearts_cannot_exceed_max_hearts`

### 3. UserStats.total_xp >= 0
- **DB constraint**: `CHECK (total_xp >= 0)` on `user_stats` table
- **Service check**: Gamification service only adds positive XP
- **Test**: `test_total_xp_cannot_be_negative`

### 4. SkillProgress.xp_earned >= 0
- **DB constraint**: `CHECK (xp_earned >= 0)` on `skill_progress` table
- **Service check**: Progress service only adds positive XP
- **Test**: `test_skill_xp_earned_cannot_be_negative`

### 5. LessonAttempt.current_exercise_index >= 0
- **DB constraint**: `CHECK (current_exercise_index >= 0)` on `lesson_attempts` table
- **Service check**: Index initialization starts at 0 and only increments
- **Test**: `test_lesson_attempt_index_cannot_be_negative`

### 6. LessonAttempt.hearts_lost >= 0
- **DB constraint**: `CHECK (hearts_lost >= 0)` on `lesson_attempts` table
- **Service check**: Increment logic on wrong answers only adds positive integers
- **Test**: `test_lesson_attempt_hearts_lost_cannot_be_negative`

### 7. LessonAttempt.xp_awarded >= 0
- **DB constraint**: `CHECK (xp_awarded >= 0)` on `lesson_attempts` table
- **Service check**: Completion logic defaults `xp_awarded` to 0 or a positive reward
- **Test**: `test_lesson_attempt_xp_awarded_cannot_be_negative`

## 2. Lesson Attempt & State Machine Invariants

### 8. One IN_PROGRESS attempt per user/lesson
- **DB constraint**: `CREATE UNIQUE INDEX idx_unique_active_attempt ON lesson_attempts(user_id, lesson_id) WHERE status = 'in_progress'`
- **Service check**: `LessonService.start_lesson` checks for and resumes existing `in_progress` attempt instead of creating a new one
- **Test**: `test_unique_active_attempt_invariant`

### 9. Only IN_PROGRESS attempts accept answers
- **DB constraint**: None (Pure business logic)
- **Service check**: `if attempt.status != AttemptStatus.in_progress: raise ConflictError(...)` in `LessonService.submit_answer`
- **Test**: `test_cannot_answer_completed_or_failed_attempt`

### 10. Submitted exercise must equal current cursor
- **DB constraint**: None (Pure business logic)
- **Service check**: `if req.exercise_id != expected_exercise.id: raise ConflictError("EXERCISE_NOT_CURRENT")`
- **Test**: `test_submitted_exercise_must_match_cursor`

### 11. FAILED attempts never become IN_PROGRESS
- **DB constraint**: State machine transition restrictions
- **Service check**: A `failed` attempt is terminal. `start_lesson` may create a **new** attempt row; it never mutates the failed row back to `in_progress`.
- **Test**: `test_failed_attempt_cannot_resume`

### 12. COMPLETED attempts never become IN_PROGRESS
- **DB constraint**: State machine transition restrictions
- **Service check**: A `completed` attempt is terminal. `start_lesson` may create a **new** attempt row for practice; it never mutates the completed row back to `in_progress`.
- **Test**: `test_completed_attempt_cannot_resume`

### 13. Completion awards XP exactly once
- **DB constraint**: None (Relies on idempotency and state)
- **Service check**: `complete_lesson` is idempotent: `if attempt.status == AttemptStatus.completed: return cached_response(attempt.xp_awarded)`. It does not re-add XP to UserStats.
- **Test**: `test_lesson_completion_is_idempotent`

### 14. Completion updates attempt + stats + progress atomically
- **DB constraint**: Enforced via RDBMS ACID transaction properties
- **Service check**: `complete_lesson` executes attempt status update, user XP addition, and skill progress updates within a single `db.commit()`
- **Test**: `test_completion_transaction_rollback_on_failure`

## 3. Business Logic & Integrity Invariants

### 15. Leaderboard ranking uses total_xp deterministically
- **DB constraint**: Query `ORDER BY total_xp DESC, id ASC`
- **Service check**: Explicit deterministic sorting in `LeaderboardService` to break ties using `user_id` or `created_at`
- **Test**: `test_leaderboard_ranking_is_deterministic`

### 16. Hearts never regenerate above max_hearts
- **DB constraint**: `CHECK (hearts <= max_hearts)` on `user_stats`
- **Service check**: Lazy regeneration on read (`GET /me/stats`, and before heart consumption) calculates elapsed intervals since `last_heart_lost_at`, adds hearts up to `max_hearts`, and persists only when state changes. No background cron, worker, or scheduled task is used.
- **Test**: `test_heart_regeneration_capped_at_max`

### 17. Refill never produces hearts > max_hearts
- **DB constraint**: `CHECK (hearts <= max_hearts)` on `user_stats`
- **Service check**: Refill explicitly sets `hearts = max_hearts` rather than just `hearts += 5`
- **Test**: `test_heart_refill_capped_at_max`

### 18. Correct answers do not cost hearts
- **DB constraint**: None
- **Service check**: `if is_correct: attempt.hearts_lost` is unmodified, and `UserStats.hearts` is unmodified
- **Test**: `test_correct_answer_does_not_cost_hearts`

### 19. Wrong answers do not advance cursor
- **DB constraint**: None
- **Service check**: `if not is_correct: attempt.current_exercise_index` remains unmodified
- **Test**: `test_wrong_answer_does_not_advance_cursor`

### 20. Initial lesson response never exposes correct_answer
- **DB constraint**: None
- **Service check**: `StartLessonResponse` and `ExerciseResponse` Pydantic schemas explicitly omit the `correct_answer` field
- **Test**: `test_lesson_start_does_not_expose_answers`
