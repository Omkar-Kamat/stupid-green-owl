# Backend System Invariants

Cross-feature invariants the backend must uphold. Each entry lists **enforcement** (DB / service / test) and maps to **verified tests** where they exist.

For architecture context see `docs/architecture.md`. For API error codes see `docs/error-taxonomy.md`.

---

## 1. Core State Invariants

### 1. UserStats.hearts >= 0

- **DB:** `CHECK (hearts >= 0)` on `user_stats`
- **Service:** `consume_heart` only decrements when `hearts > 0`
- **At zero hearts:** no deduction attempted; wrong answer ends attempt with `lesson_failed: true` (HTTP 200, **not** 403)
- **Tests:** DB constraint via `test_database_invariants.py`; adversarial zero-hearts in `test_qa_adversarial.py`

### 2. UserStats.hearts <= max_hearts

- **DB:** `CHECK (hearts <= max_hearts)` on `user_stats`
- **Service:** Regeneration and refill cap at `max_hearts`
- **Tests:** `test_heart_regeneration.py`, `test_heart_refill_*`

### 3. UserStats.total_xp >= 0

- **DB:** `CHECK (total_xp >= 0)` on `user_stats`
- **Service:** `GamificationService` only adds XP; never subtracts
- **Tests:** Indirectly via completion tests; dedicated service test **recommended**

### 3b. UserStats.gems >= 0

- **DB:** `CHECK (gems >= 0)` on `user_stats` (migration `d5e6f7a8b9c0`)
- **Service:** `refill_hearts` rejects when gems insufficient
- **Tests:** `test_database_invariants.py::test_negative_gems_rejected`

### 4. SkillProgress.xp_earned >= 0

- **DB:** `CHECK (xp_earned >= 0)` on `skill_progress`
- **Service:** Progress service only adds positive XP
- **Tests:** DB constraint in `test_database_invariants.py`

### 5. LessonAttempt.current_exercise_index >= 0

- **DB:** `CHECK (current_exercise_index >= 0)` on `lesson_attempts`
- **Service:** Starts at 0; increments only on correct answer
- **Tests:** DB constraint in `test_database_invariants.py`

### 6. LessonAttempt.hearts_lost >= 0

- **DB:** `CHECK (hearts_lost >= 0)` on `lesson_attempts`
- **Service:** Incremented on wrong answers only
- **Tests:** DB constraint in `test_database_invariants.py`

### 7. LessonAttempt.xp_awarded >= 0

- **DB:** `CHECK (xp_awarded >= 0)` when set
- **Service:** Set once to positive `Skill.xp_reward_per_lesson` on completion
- **Tests:** DB constraint; completion tests verify value

---

## 2. Lesson Attempt & State Machine Invariants

### 8. One IN_PROGRESS attempt per (user, lesson)

- **DB:** Partial unique index `idx_one_active_attempt_per_lesson` on `(user_id, lesson_id) WHERE status = 'in_progress'`
- **Service:** `start_lesson` resumes existing active attempt; IntegrityError recovery on race
- **Tests:** `test_database_invariants.py`, `test_lesson_start.py`, `test_concurrent_start` (service)

### 9. Only IN_PROGRESS attempts accept answers

- **Service:** `if attempt.status != in_progress: raise ConflictError("ATTEMPT_ALREADY_TERMINATED")`
- **Tests:** `test_answers.py` (terminated attempt cases)

### 10. Submitted exercise must equal current cursor

- **Service:** `if req.exercise_id != expected_exercise.id: raise ConflictError("EXERCISE_NOT_CURRENT")`
- **Tests:** `test_answers.py`

### 11. FAILED attempts never become IN_PROGRESS

- **Service:** Terminal state. `start_lesson` creates a **new** row; never mutates failed row.
- **Tests:** Implicit in start/resume tests; explicit resume-failed test **recommended**

### 12. COMPLETED attempts never become IN_PROGRESS

- **Service:** Terminal state. Practice creates a **new** row.
- **Tests:** Idempotent complete test; practice-start test **recommended**

### 13. Completion awards XP exactly once

- **Service:** Conditional `try_complete_attempt` gate plus cached response when `status == completed`
- **Tests:** `test_idempotent_retry`, `test_double_complete_awards_xp_once`, `test_try_complete_attempt_is_exclusive`

### 14. Completion updates attempt + stats + progress atomically

- **Service:** Single `db.commit()` in `complete_lesson`; rollback on failure
- **Tests:** `test_completion_transaction_rollback_on_failure`

---

## 3. Business Logic & Integrity Invariants

### 15. Leaderboard ranking is deterministic

- **Service:** `ORDER BY total_xp DESC, user_id ASC`
- **Tests:** `test_leaderboard.py`

### 16. Hearts never regenerate above max_hearts

- **DB:** `CHECK (hearts <= max_hearts)`
- **Service:** Lazy regeneration on read (`GET /me/stats`, and inside `consume_heart` before deduction). Calculates elapsed 4-hour intervals since `last_heart_lost_at`, adds hearts up to `max_hearts`, persists only when changed. **No background cron, worker, or scheduled task.**
- **Tests:** `test_heart_regeneration.py`

### 17. Refill never produces hearts > max_hearts

- **Service:** Sets `hearts = max_hearts` (not incremental add)
- **Tests:** `test_heart_regeneration.py` (refill path)

### 18. Correct answers do not cost hearts

- **Service:** `UserStats.hearts` unchanged on correct answer
- **Tests:** `test_answers.py`

### 19. Wrong answers do not advance cursor

- **Service:** `current_exercise_index` unchanged when `is_correct == false`
- **Tests:** `test_answers.py`, smoke test

### 20. Lesson start response never exposes correct_answer

- **Service:** `ExerciseResponse` schema omits `correct_answer`; only returned after answer submit for feedback
- **Tests:** `test_lessons.py` (start response shape)

### 21. Locked skills cannot be started via API

- **Service:** `start_lesson` re-derives skill status server-side → `403 SKILL_LOCKED`
- **Tests:** `test_lessons.py`, `test_qa_adversarial.py`

### 22. Server owns XP, hearts, streak, unlock state

- **Service:** Client sends only `exercise_id` + `answer`; no client-supplied gamification fields accepted
- **Tests:** Implicit in all API tests; no endpoint accepts XP/hearts in body

---

## 4. Known Gaps (Not Yet Invariant-Tested)

| Invariant | Status |
|---|---|
| Practice start after completion | Implemented; **no dedicated test** |
| Threaded HTTP concurrent completion on SQLite | Atomic DB gate + poll fallback; environment-limited — see `BACKEND/README.md` |

See `docs/architecture.md` Known Implementation Gaps.
