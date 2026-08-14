import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { startMock, answerMock, completeMock, refreshMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  answerMock: vi.fn(),
  completeMock: vi.fn(),
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
    answer: (...args: unknown[]) => answerMock(...args),
    complete: (...args: unknown[]) => completeMock(...args),
  },
}));

vi.mock("@/components/providers/UserStatsProvider", () => ({
  useOptionalUserStats: () => ({ refresh: refreshMock }),
}));

vi.mock("@/components/lesson/LessonShell", () => ({
  LessonShell: ({
    children,
    footer,
  }: {
    children: React.ReactNode;
    footer: React.ReactNode;
  }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

import { ApiLessonPlayer } from "@/components/lesson/ApiLessonPlayer";

describe("ApiLessonPlayer lesson flow", () => {
  beforeEach(() => {
    startMock.mockReset();
    answerMock.mockReset();
    completeMock.mockReset();
    refreshMock.mockReset();
  });

  it("submits the final answer and completes the lesson", async () => {
    startMock.mockResolvedValue({
      attempt_id: 42,
      current_exercise_index: 0,
      hearts_remaining: 5,
      exercises: [
        {
          id: 7,
          type: "multiple_choice",
          prompt: "Choose A",
          data: { options: ["A", "B"] },
        },
      ],
    });

    answerMock.mockResolvedValue({
      correct: true,
      hearts_remaining: 5,
      next_exercise_index: 1,
      correct_answer: "A",
      lesson_failed: false,
    });

    completeMock.mockResolvedValue({
      xp_awarded: 10,
      total_xp: 110,
      streak: 3,
      crown_earned: false,
    });

    render(<ApiLessonPlayer lessonId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Choose A")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(answerMock).toHaveBeenCalledWith(42, {
        exercise_id: 7,
        answer: "A",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(completeMock).toHaveBeenCalledWith(42);
    });

    expect(await screen.findByText("Lesson complete!")).toBeInTheDocument();
    expect(screen.getByText(/\+10 XP/)).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalled();
  });
});
