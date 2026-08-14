# Backend - Duolingo Clone (stupid-green-owl)

A comprehensive backend service for a language learning platform, implementing core gamification, progression, and lesson mechanics. **Assignment-ready** for local/demo deployment; not positioned as production-hardened infrastructure.

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
- **Testing**: Pytest + httpx TestClient

## Key Engineering Decisions
- **Route → Service → Repository**: Strict boundary separation. Routes handle HTTP only, repositories handle SQL only, and services own the business logic.
- **Service-Owned Transactions**: Multi-table state mutations (like lesson completions updating Attempts, UserStats, and SkillProgress) are executed atomically within a single `db.commit()` inside the service layer.
- **LessonAttempt State Machine**: Each attempt has terminal states (`completed` or `failed`); a `LessonAttempt` never transitions backward. Retrying or practicing after completion/failure creates a **new** `in_progress` attempt row.
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
├── seed.py               # Demo reset/reseed script (wipes and recreates demo data)
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

The database must be seeded for local demo and release verification. **`seed.py` is a deterministic reset/reseed** — it wipes all course and learner rows, then recreates the Japanese demo dataset. Safe to run before demos; do not describe it as a partial upsert.

```bash
python seed.py
```

This creates:
- **Course**: Japanese for English Speakers (2 units, 4 skills, 4 lessons, 40+ exercises)
- **Exercise types**: all five (`multiple_choice`, `translate`, `match_pairs`, `fill_blank`, `type_answer`)
- **Users**: `demo_learner` (id=1) plus 4 leaderboard filler users

End-to-end verification:

```bash
# With backend running on :8000
bash scripts/smoke_test.sh

# Full fresh-install check (venv, migrate, seed, pytest, downgrade/upgrade, smoke)
bash scripts/verify_fresh_install.sh
```

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
3. **Seed**: Run `python seed.py` (deterministic reset/reseed).
4. **Start**: Deploy via Docker/Gunicorn wrapping Uvicorn workers.

**PostgreSQL**: The ORM layer is Postgres-compatible. For production beyond this assignment scope, set `DATABASE_URL` and install `psycopg[binary]` (documented in `requirements.txt`, not installed by default).

**OpenAPI**: Canonical spec is `docs/openapi.json`. Regenerate with `bash scripts/export_openapi.sh` while the server is running.

**Frontend**: Set `NEXT_PUBLIC_API_URL` to the deployed backend origin. Without it, the Next.js client falls back to `http://localhost:8000`.

**CORS**: Set `CORS_ORIGINS` to a JSON array that includes your deployed frontend origin (for example `["https://your-app.vercel.app"]`). The default `["http://localhost:3000"]` only allows local development; a hosted frontend on a different origin will be blocked until this is updated.

## Known Limitations
- The `type_answer` evaluator currently uses strict string equality. NLP/Levenshtein distance matching would be required for a production typo-forgiving experience.
- Leaderboard uses a direct `ORDER BY total_xp DESC` query which scales poorly. A real system would use a Redis Sorted Set (ZSET).
- **`POST /complete` concurrent retries** use a conditional DB update (`try_complete_attempt`) with a brief poll fallback so losing requests return the cached completion response once the winner commits. True threaded HTTP races on SQLite remain environment-limited.
- **Concurrent wrong-answer submissions** can consume multiple hearts (only duplicate *correct* answers are blocked by a partial unique index).
- **`GET /path` lesson lookup** batch-fetches primary `lesson_id` per skill in one query (no per-skill N+1).
