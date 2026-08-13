/** Matches BACKEND/seed.py user id=1. Backend auth is mocked (no login API yet). */
export const DEMO_CREDENTIALS = {
  username: "demo_learner",
  /** No password column in DB; placeholder for the login UI. */
  password: "password",
  userId: 1,
} as const;

const SESSION_KEY = "sgo_demo_session";

export type DemoSession = {
  userId: number;
  username: string;
  signedInAt: number;
};

export function signInAsDemoUser(): DemoSession {
  const session: DemoSession = {
    userId: DEMO_CREDENTIALS.userId,
    username: DEMO_CREDENTIALS.username,
    signedInAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}
