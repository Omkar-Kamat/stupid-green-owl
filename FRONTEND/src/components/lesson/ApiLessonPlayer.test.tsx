import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { startMock, refreshMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/api", () => ({
  lessonApi: {
    start: (...args: unknown[]) => startMock(...args),
    answer: vi.fn(),
    complete: vi.fn(),
  },
}));

vi.mock("@/components/providers/UserStatsProvider", () => ({
  useOptionalUserStats: () => ({ refresh: refreshMock }),
}));

vi.mock("@/components/lesson/LessonShell", () => ({
  LessonShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/lesson/BackendExerciseView", () => ({
  BackendExerciseView: () => <div>exercise-view</div>,
}));

vi.mock("@/components/lesson/FeedbackBar", () => ({
  CorrectFeedbackBar: () => null,
  IncorrectFeedbackBar: () => null,
}));

vi.mock("@/components/lesson/LessonFooter", () => ({
  CheckButton: () => <button type="button">Check</button>,
  LessonActionFooter: ({ right }: { right: React.ReactNode }) => <div>{right}</div>,
}));

import { ApiLessonPlayer } from "@/components/lesson/ApiLessonPlayer";

describe("ApiLessonPlayer", () => {
  beforeEach(() => {
    startMock.mockReset();
  });

  it("shows loading state before lesson start resolves", () => {
    startMock.mockReturnValue(new Promise(() => {}));
    render(<ApiLessonPlayer lessonId={1} />);
    expect(screen.getByText("Loading lesson…")).toBeInTheDocument();
  });

  it("renders exercise view after successful start", async () => {
    startMock.mockResolvedValue({
      attempt_id: 10,
      current_exercise_index: 0,
      hearts_remaining: 5,
      exercises: [
        { id: 1, type: "multiple_choice", prompt: "Pick one", data: { options: ["A", "B"] } },
      ],
    });

    render(<ApiLessonPlayer lessonId={1} />);

    await waitFor(() => {
      expect(screen.getByText("exercise-view")).toBeInTheDocument();
    });
    expect(startMock).toHaveBeenCalledWith(1);
  });
});
