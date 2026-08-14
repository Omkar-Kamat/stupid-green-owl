import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LearnRightPanel } from "@/components/learn/LearnRightPanel";

vi.mock("@/components/providers/UserStatsProvider", () => ({
  useOptionalUserStats: () => ({
    stats: null,
    loading: false,
    error: "Cannot reach the server.",
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/learn/LearnStatsBar", () => ({
  LearnStatsBar: () => <div data-testid="stats-bar">stats-bar</div>,
}));

vi.mock("@/components/learn/LearnRightPanelFooter", () => ({
  LearnRightPanelFooter: () => <div>footer</div>,
}));

describe("LearnRightPanel", () => {
  it("shows error and retry instead of zero XP when stats fail", () => {
    render(<LearnRightPanel />);

    expect(screen.getByText("Cannot reach the server.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText(/Total XP: 0/)).not.toBeInTheDocument();
  });
});
