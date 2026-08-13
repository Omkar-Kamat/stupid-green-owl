# Architecture

## System/Layered Architecture

The backend follows a layered architecture to strictly separate concerns, ensuring that business rules, request parsing, and data persistence do not leak into each other.

**BUILD**
- **Layer 1: Routes/Controllers (HTTP-only)**: FastApi routes. Parses incoming HTTP requests, calls the appropriate service, and maps the domain response/error into HTTP responses (Pydantic DTOs). No business logic.
- **Layer 2: Services (Business Logic)**: Owns invariants, state transitions, transaction management, and orchestration (e.g., "completing a lesson"). Talks exclusively to repositories, never raw `db.query(...)`. 
- **Layer 3: Repositories (Persistence)**: Handles data access logic (SQLAlchemy). Knows how to fetch/save database rows. Ignorant of business rules (e.g., doesn't know how much XP a lesson gives).
- **Database Boundary (SQLite/Postgres)**: Single DB connection instance passed via dependency injection to repositories.

**DESIGN-ONLY**
- **Microservices / Message Brokers / Background Workers**: The 24-hour scope runs entirely in a single monolithic process synchronously.
- **Service Mesh / Read Replicas**: Out of scope for current architecture.

## Module Boundaries

**BUILD**
The backend is divided into the following modules based on business capabilities:
- **Lessons**: `LessonService`, `LessonRepository` - Handles path navigation, fetching exercises, and lesson progression.
- **Gamification**: `GamificationService` - Orchestrates XP, hearts, streaks, daily goals, and achievements.
- **Progress**: `ProgressService`, `ProgressRepository` - Manages skill/crown levels and unlocking cascade for the user's path.
- **Users**: `UserRepository` - Core user profile data.
- **Evaluators**: `AnswerEvaluator` registry (Strategy Pattern) - Determines correctness based on exercise type (e.g., `multiple_choice`, `translate`).

## Dependency Direction

Dependencies must point strictly downwards:
`Routes` -> `Services` -> `Repositories` -> `Database / ORM Models`

- **Cross-module Dependencies**: A service may call another service (e.g., `LessonService.complete_lesson` orchestrates both `GamificationService` and `ProgressService`), or a service may call multiple repositories, but a repository cannot call a service, and routes cannot call repositories directly.

## Responsibilities & Boundaries

**BUILD**
- **Controller/API Boundary**: Defines `/api/v1/` routes. Exposes Pydantic DTOs, never returns SQLAlchemy ORM models.
- **Service/Use-case Boundary**: Enforces business invariants. For example, `LessonService.complete_lesson` ensures XP is awarded at most once.
- **Repository Responsibilities**: Avoid N+1 query patterns. Zips data optimally (e.g., `unit` -> `skill` -> `skill_progress`). Does not make business decisions.
- **Validation Boundary**: Handled by FastAPI + Pydantic at the routing layer for payload shape. Business rule validation (e.g., "skill is locked") is enforced in the Service layer.
- **Authentication/Authorization Boundary**: 
  - Fake Auth for now: `get_current_user` dependency providing `DEFAULT_USER_ID=1`.
  - Service methods explicitly require `user_id` as arguments.
- **Error-Handling Boundary**: 
  - Services throw domain-specific exceptions (e.g., `ForbiddenError`, `ConflictError`).
  - FastAPI exception handlers translate these domain exceptions to structured HTTP status codes and JSON error responses.
- **Transaction Ownership**: 
  - Managed strictly by the Service layer. Repositories must not commit.
  - **Start/Resume Flow**: Implicit transaction begins. Service validates lesson/skill (Read), queries active `LessonAttempt` (Read), and if none exists, `db.add(new_attempt)` (Write), followed by a single `db.commit()`. If `IntegrityError` occurs (e.g. concurrent race condition), `db.rollback()` is issued explicitly before recovery.
  - **Complete Flow**: `LessonService.complete_lesson` orchestrates a single `db.commit()` encompassing attempt status, and delegates domain-specific updates to `GamificationService` (XP, streak, daily goal) and `ProgressService` (skill progress, crown levels, unlocking). If one fails, `db.rollback()` is issued.

## Request Lifecycle

1. FastAPI route receives an HTTP request and validates the payload shape via Pydantic.
2. FastAPI injects `get_current_user` and the required `Service` dependencies.
3. The Route calls the Service method, passing `user_id` and parsed domain variables.
4. The Service invokes one or more Repositories to load state.
5. The Service applies business logic (e.g., evaluating an answer using `EVALUATORS` registry).
6. The Service mutates state and calls `db.commit()` if required.
7. The Service returns a domain result to the Route.
8. The Route maps the result to a Pydantic response DTO and returns it.

## Important Data Flows

- **Path Loading**: Client requests `/path`. Route calls `LessonService.get_path`. Service fetches `Unit -> Skill` tree and user `SkillProgress` (via Repositories). Service merges progress with skills and returns to route.
- **Answer Submission**: Route -> `LessonService.submit_answer` -> `LessonRepository` (fetch attempt + exercise) -> `EVALUATORS[exercise.type]` -> `GamificationService` (deduct heart if wrong) -> Commit -> Return response.

## What is intentionally NOT abstracted

**BUILD**
- Event buses are intentionally omitted; `GamificationService` is called directly by `LessonService`.
- No generic `BaseRepository[T]`. Explicit methods like `get_lesson_with_exercises()` are preferred to encapsulate specific optimized query shapes.
- No DTO-to-Model mapping frameworks; mapping is done manually or via Pydantic `model_validate(orm_obj)`.

## Exercise Data Contracts
Feature 3 will evaluate answers using a registry of evaluators. The expected JSON shape for `Exercise.data` is:
- **Multiple Choice**: `{"options": ["A", "B", "C"]}`
- **Translate**: `{"source_text": "text", "word_bank": ["A", "B"]}`
- **Match Pairs**: `{"pairs": [{"left": "A", "right": "B"}]}`
- **Fill Blank**: `{"sentence": "A ___ B", "options": ["C", "D"]}`
- **Type Answer**: `{"placeholder": "Type your answer"}`

## Error Handling Strategy
Domain exceptions (e.g. `NotFoundError`, `ConflictError`) are mapped via FastAPI exception handlers to structured HTTP status codes and API-stable string error codes like `LESSON_LOCKED`. The future architecture will evolve these into nested objects: `{"error": {"code": "LESSON_LOCKED", "message": "..."}}`.

## Lesson Attempt Domain Responsibilities (Feature 3)
- **Lesson**: Immutable template representing a segment of a skill. Owns its ordered list of `Exercises`.
- **LessonAttempt**: Tracks a user's execution session of a `Lesson`. Owns the current state, progress cursor (`current_exercise_index`), hearts lost during this session, and whether a crown was earned.
- **Exercise**: Immutable representation of a single problem. Owns the prompt, frontend presentation data, and authoritative `correct_answer`.
- **ExerciseAttempt**: Tracks a user's single submitted answer and its correctness.
- **LessonService**: Orchestrates starting/resuming lessons, validations (skill availability), active attempt resolution, concurrency recovery, and stripping sensitive data (correct_answer) before returning to the frontend.
- **Repositories**: Eagerly load exercises (`LessonRepository.get_lesson_with_exercises()`), fetch/save active attempts (`AttemptRepository`). Strictly data access, no business logic or commits.

## Lesson Attempt State Machine (Feature 3)
| Current State | Action | Next State | Allowed? | Side Effects |
| --- | --- | --- | --- | --- |
| *None* | start | `in_progress` | YES | DB insert new `LessonAttempt` |
| `in_progress` | start/resume | `in_progress` | YES | Returns existing attempt |
| `completed` | start | `in_progress` | YES | Creates a *new* attempt (practice mode) |
| `failed` | start | `in_progress` | YES | Creates a *new* attempt (retry) |
| `in_progress` | completed | `completed` | YES | - sets `completed_at`<br>- records `xp_awarded`<br>- invokes completion/gamification transaction |
| `in_progress` | failed | `failed` | YES | Hearts reach zero, sets `completed_at` |
| `completed` | answer | - | NO | 409 Conflict (`ATTEMPT_ALREADY_TERMINATED`) |
| `failed` | answer | - | NO | 409 Conflict (`ATTEMPT_ALREADY_TERMINATED`) |
| `completed` | complete | - | NO | 409 Conflict (`ATTEMPT_ALREADY_TERMINATED`) |
| `failed` | complete | - | NO | 409 Conflict (`ATTEMPT_ALREADY_TERMINATED`) |

## Hearts State Management
- `LessonAttempt.hearts_lost`: Attempt-local state tracking how many mistakes were made *during this specific session*.
- `UserStats.hearts`: The user's current authoritative global heart balance.
- `StartLessonResponse.hearts_remaining`: Supplied directly from `UserStats.hearts` at the time the lesson is started.

## Concurrency Strategy (Feature 3)
- **Simultaneous Starts**: The SQLite database enforces exactly one active attempt via the partial unique index: `UNIQUE(user_id, lesson_id) WHERE status = 'in_progress'`. If two requests simultaneously start a lesson, the first commits successfully. The second encounters an `IntegrityError`. `LessonService` must catch this, execute a `db.rollback()`, and gracefully re-query for the now-existing active attempt, returning it seamlessly as a "Resume".
