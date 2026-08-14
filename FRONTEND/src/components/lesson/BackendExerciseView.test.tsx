import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackendExerciseView } from "@/components/lesson/BackendExerciseView";
import type { ExerciseResponse } from "@/lib/api/types";

const baseProps = {
  locked: false,
  showCorrect: false,
  correctAnswer: null,
  draftAnswer: null,
  onChange: vi.fn(),
};

describe("BackendExerciseView", () => {
  it("renders multiple_choice options", () => {
    const exercise: ExerciseResponse = {
      id: 1,
      type: "multiple_choice",
      prompt: "Pick the correct answer",
      data: { options: ["A", "B"] },
    };

    render(<BackendExerciseView {...baseProps} exercise={exercise} />);
    expect(screen.getByText("Pick the correct answer")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders fill_blank sentence and word bank", () => {
    const exercise: ExerciseResponse = {
      id: 2,
      type: "fill_blank",
      prompt: "Fill the blank",
      data: { sentence: "Hello _", options: ["world"] },
    };

    render(<BackendExerciseView {...baseProps} exercise={exercise} />);
    expect(screen.getByText("Hello _")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders type_answer input", () => {
    const exercise: ExerciseResponse = {
      id: 3,
      type: "type_answer",
      prompt: "Type the word",
      data: { placeholder: "Enter text" },
    };

    render(<BackendExerciseView {...baseProps} exercise={exercise} />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders translate word bank tiles", () => {
    const exercise: ExerciseResponse = {
      id: 4,
      type: "translate",
      prompt: "Translate this",
      data: { word_bank: ["hello", "world"] },
    };

    render(<BackendExerciseView {...baseProps} exercise={exercise} />);
    expect(screen.getByText("Translate this")).toBeInTheDocument();
    expect(screen.getAllByText("hello").length).toBeGreaterThan(0);
    expect(screen.getAllByText("world").length).toBeGreaterThan(0);
  });

  it("renders match_pairs selects", () => {
    const exercise: ExerciseResponse = {
      id: 5,
      type: "match_pairs",
      prompt: "Match pairs",
      data: {
        pairs: [{ id: "p1", left: "Cat" }],
        right_options: [{ id: "r1", right: "Neko" }],
      },
    };

    render(<BackendExerciseView {...baseProps} exercise={exercise} />);
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onChange when a multiple_choice option is selected", () => {
    const onChange = vi.fn();
    const exercise: ExerciseResponse = {
      id: 1,
      type: "multiple_choice",
      prompt: "Pick one",
      data: { options: ["A", "B"] },
    };

    const { container } = render(
      <BackendExerciseView {...baseProps} exercise={exercise} onChange={onChange} />,
    );
    const optionButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("A"),
    );
    expect(optionButton).toBeTruthy();
    fireEvent.click(optionButton!);
    expect(onChange).toHaveBeenCalledWith("A");
  });
});
