# Backend - Duolingo Clone (stupid-green-owl)

A comprehensive backend service for a language learning platform, implementing the core gamification, progression, and learning mechanics of Duolingo. Built with a focus on strict state-machine invariants, robust transaction boundaries, and a scalable 3-tier architecture.

## Features
- **Course Progression**: Hydrates hierarchical `Course → Unit → Skill` structures locked against a user's progress.
- **Stateful Lesson Attempts**: Manages `in_progress`, `completed`, and `failed` state transitions safely.
- **Gamification Mechanics**: Handles XP, streak counting, streak breakage, and crowns.
- **Lazy Heart Regeneration**: Time-based deterministic heart regeneration calculated dynamically upon read, eliminating the need for cron jobs.
- **Pluggable Evaluators**: Evaluates diverse exercise types (`multiple_choice`, `translate`, `type_answer`, `fill_blank`, `match_pairs`) via a strategy registry.
- **Global Leaderboard**: Ranks users by XP dynamically.

## Tech Stack
- **Framework**: FastAPI (Python 3.12+)
- **Database**: SQLite
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation/Serialization**: Pydantic v2
- **Testing**: Pytest (with pytest-asyncio and httpx)

## Key Engineering Decisions
- **Route → Service → Repository**: Strict boundary separation. Routes handle HTTP only, repositories handle SQL only, and services own the business logic.
- **Service-Owned Transactions**: Multi-table state mutations (like lesson completions updating Attempts, UserStats, and SkillProgress) are executed atomically within a single `db.commit()` inside the service layer.
- **LessonAttempt State Machine**: Strict unidirectional transitions (`in_progress` → `completed` or `failed`).
- **Evaluator Strategy Registry**: The `ExerciseEvaluator` class uses a dictionary registry to route answers to specific evaluation functions based on `ExerciseType`.
- **DB-Enforced Active Attempt Invariant**: A Partial Unique Index (`CREATE UNIQUE INDEX ... WHERE status = 'in_progress'`) guarantees exactly one active attempt per user/lesson at the database level.
- **Idempotent Completion**: The `complete_lesson` endpoint caches the XP awarded on the `LessonAttempt`. Repeated completion calls return the cached state rather than duplicating XP.
- **Lazy Heart Regeneration**: Time intervals are calculated against `UserStats.last_heart_lost_at` when stats are requested, updating the database in-band gracefully without a background worker.
- **SQLite Scope/Tradeoffs**: Deliberately chosen to avoid `docker-compose` complexity for the assignment. All transactions are local and strictly synchronous, avoiding distributed locking (Redis).

## Architecture
The backend is structured using a standard 3-tier architecture:
1. **Controllers (Routes)**: `app/api/v1/routes/` - Maps HTTP requests to Pydantic schemas and passes them to services.
2. **Services (Business Logic)**: `app/services/` - Orchestrates repositories, handles domain logic, and manages transaction (`db.commit()`) boundaries.
3. **Repositories (Data Access)**: `app/repositories/` - Isolates SQLAlchemy queries. Returns domain models to services.

## Repository Structure
```text
BACKEND/
├── alembic/              # Database migration scripts
├── app/
│   ├── api/              # Controllers, dependencies (DI), and routing
│   ├── core/             # Config, exceptions, and DB session
│   ├── models/           # SQLAlchemy ORM definitions
│   ├── repositories/     # Data access layer
│   ├── schemas/          # Pydantic validation schemas (DTOs)
│   └── services/         # Business logic & evaluators
├── tests/                # Pytest suites (unit, integration, invariants)
├── seed.py               # Idempotent DB hydration script
└── requirements.txt      # Python dependencies
```

## Database Schema
The database uses standard relational models:
- **Content**: `courses`, `units`, `skills`, `lessons`, `exercises`
- **Users**: `users`, `user_stats`, `skill_progress`
- **Telemetry**: `lesson_attempts`, `exercise_attempts`

*(See `docs/database.md` for the full schema and ERD)*

## API
All endpoints are versioned under `/api/v1/` and enforce strict schema boundaries (e.g., correct answers are never leaked during lesson start).

- `GET /me` - Current user profile
- `GET /me/stats` - Gamification state (Hearts, XP, Streak)
- `POST /me/hearts/refill` - Spend gems to refill hearts
- `GET /path` - Full course tree with user unlock status
- `POST /lessons/{id}/start` - Begin or resume a lesson
- `POST /lesson-attempts/{id}/answers` - Evaluate an exercise answer
- `POST /lesson-attempts/{id}/complete` - Finalize attempt and award XP
- `GET /leaderboard` - Top users sorted by XP

*(See `docs/api-contract.md` for full request/response shapes)*

## Setup
```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
uvicorn app.main:app --port 8000 --reload
```
The API documentation (Swagger) is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Migrations
Migrations are managed via Alembic:
```bash
# Upgrade database to current head
alembic upgrade head

# If making schema changes:
alembic revision --autogenerate -m "Add new table"
```

## Seed Data
The database must be seeded to test the core features. The seed script is idempotent and safe to run multiple times:
```bash
python seed.py
```
This sets up a Spanish course, multiple units/skills, exercises, and 5 leaderboard users.

## Running Tests
Tests cover unit boundaries, API integration, adversarial QA attacks, and transaction rollbacks.
```bash
PYTHONPATH=. pytest
```

## Demo Credentials / Default User
Authentication is mocked for this assignment context. A global dependency `get_current_user` automatically injects `user_id = 1` (`demo_learner`) into all protected routes. No JWTs or Bearer tokens are required to test the API locally.

## Design Decisions
- **No Redis / Event Bus**: To keep the assignment self-contained and reviewable, we eschewed external caches or queues. All state is eagerly computed or lazily resolved directly against the primary RDBMS.
- **Pydantic Separation**: ORM models are strictly translated to Pydantic DTO schemas in the router layer. No SQLAlchemy instances are ever leaked directly to the client.

## Assumptions / Tradeoffs
- **Single Tenant**: Assumes a single user is primarily being tested. Auth is hardcoded to a mock dependency.
- **SQLite Concurrency**: SQLite `IntegrityError`s during concurrent `start_lesson` calls are gracefully caught, rolling back the transaction and fetching the winning attempt.

## Deployment

Deployment must not rely on the local SQLite file being pre-populated. Startup sequences for fresh environments must follow:
1. **Deploy**: Build artifact and set environment configuration.
2. **Migrate**: Run `alembic upgrade head` against a fresh volume/database.
3. **Seed**: Run `python seed.py` if appropriate (idempotency guarantees it is safe).
4. **Start**: Deploy via Docker/Gunicorn wrapping Uvicorn workers.

**⚠️ SQLite Scope Tradeoff**: For this assignment, using SQLite is a deliberate scope tradeoff. For production, deployment should provide a `DATABASE_URL` pointing to PostgreSQL rather than relying on ephemeral container disk persistence.

## Known Limitations
- The `type_answer` evaluator currently uses strict string equality. NLP/Levenshtein distance matching would be required for a production typo-forgiving experience.
- Leaderboard uses a direct `ORDER BY total_xp DESC` query which scales poorly. A real system would use a Redis Sorted Set (ZSET).
