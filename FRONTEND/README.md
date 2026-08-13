# Frontend

Next.js App Router UI for the Duolingo-style learning platform.

## Setup

```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:3000/learn/japanese](http://localhost:3000/learn/japanese).

## Backend integration

The production learner journey uses **`ApiLessonPlayer`** at `/lesson/[lessonId]`, wired to the FastAPI backend via `src/lib/api/`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend origin (default `http://localhost:8000`) |

**Deploy:** set `NEXT_PUBLIC_API_URL` to your deployed backend URL. Without it, the client falls back to localhost.

## Demo vs prototype routes

| Route | Data source |
|---|---|
| `/learn/japanese`, `/lesson/[id]`, profile, shop, leaderboard | Live backend API |
| `/lesson/listening/*`, `/lesson/translate/*`, `/lesson/meaning/*` | Local UI prototypes (`LessonPlayer` + mock exercises) |

Auth is mocked server-side (`DEFAULT_USER_ID=1`); the login page writes a local demo session only.

## Verification

```bash
npm run build
# With backend running:
npm run dev
```
