import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LearningPath } from "@/components/learn/LearningPath";
import type { PathResponse } from "@/lib/api/types";

const { getPathMock } = vi.hoisted(() => ({
  getPathMock: vi.fn(),
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
  pathApi: {
    getPath: (...args: unknown[]) => getPathMock(...args),
  },
}));

const pathFixture: PathResponse = {
  units: [
    {
      id: 1,
      title: "Basics",
      color_theme: "green",
      skills: [
        {
          id: 1,
          title: "Completed Skill",
          icon: "star",
          status: "completed",
          crown_level: 1,
          lesson_id: 101,
        },
        {
          id: 2,
          title: "Active Skill",
          icon: "star",
          status: "available",
          crown_level: 0,
          lesson_id: 202,
        },
        {
          id: 3,
          title: "Locked Skill",
          icon: "star",
          status: "locked",
          crown_level: 0,
          lesson_id: 303,
        },
      ],
    },
  ],
};

describe("LearningPath", () => {
  beforeEach(() => {
    getPathMock.mockReset();
  });

  it("links available and completed skills to lesson_id routes", async () => {
    getPathMock.mockResolvedValue(pathFixture);
    render(<LearningPath />);

    await waitFor(() => {
      expect(screen.getByLabelText("Completed Skill")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Completed Skill")).toHaveAttribute("href", "/lesson/101");
    expect(screen.getByLabelText("Active Skill")).toHaveAttribute("href", "/lesson/202");
  });

  it("renders locked skills without navigation links", async () => {
    getPathMock.mockResolvedValue(pathFixture);
    render(<LearningPath />);

    await waitFor(() => {
      expect(screen.getAllByLabelText("Locked Skill (locked)").length).toBeGreaterThan(0);
    });

    const lockedButtons = screen
      .getAllByLabelText("Locked Skill (locked)")
      .filter((node) => node.tagName === "BUTTON");
    expect(lockedButtons.length).toBeGreaterThan(0);
    expect(lockedButtons[0]).toBeDisabled();
  });

  it("shows retry UI when path fetch fails", async () => {
    getPathMock.mockRejectedValue(new Error("Network down"));
    render(<LearningPath />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });
  });

  it("banner reflects last completed skill when none are available", async () => {
    getPathMock.mockResolvedValue({
      units: [
        {
          id: 1,
          title: "Basics",
          color_theme: "green",
          skills: [
            {
              id: 1,
              title: "First Skill",
              icon: "star",
              status: "completed",
              crown_level: 1,
              lesson_id: 101,
            },
            {
              id: 2,
              title: "Last Completed",
              icon: "star",
              status: "completed",
              crown_level: 2,
              lesson_id: 202,
            },
          ],
        },
      ],
    });

    render(<LearningPath />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2, name: "Last Completed" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { level: 2, name: "First Skill" })).not.toBeInTheDocument();
  });
});
