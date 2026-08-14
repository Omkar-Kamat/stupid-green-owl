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

The learner journey uses **`ApiLessonPlayer`** at `/lesson/[lessonId]`, wired to the FastAPI backend via `src/lib/api/`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend origin (default `http://localhost:8000`) |

**Deploy:** set `NEXT_PUBLIC_API_URL` to your deployed backend URL. Without it, the client falls back to localhost.

## Assumptions

Authentication is mocked for this assignment. The backend injects `DEFAULT_USER_ID=1` on all protected routes; no JWT or session token is required. The `/login` page writes a local demo session only — there is no route guard, and you can navigate directly to `/learn/japanese` without signing in.

## Verification

```bash
npm run build
# With backend running:
npm run dev
```
