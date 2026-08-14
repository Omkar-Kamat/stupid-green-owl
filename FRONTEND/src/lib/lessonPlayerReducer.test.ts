import { describe, expect, it } from "vitest";
import {
  createInitialState,
  lessonPlayerReducer,
  canCheckAnswer,
} from "@/lib/lessonPlayerReducer";
import { MEANING_EXERCISE, MEANING_EXERCISE_2 } from "@/data/demoExercises";

describe("lessonPlayerReducer", () => {
  const meaningLesson = [MEANING_EXERCISE];

  it("requires a selected option before check on meaning exercises", () => {
    const state = createInitialState(MEANING_EXERCISE);
    expect(canCheckAnswer(MEANING_EXERCISE, state)).toBe(false);

    const selected = lessonPlayerReducer(
      state,
      { type: "SELECT_OPTION", optionId: "to" },
      meaningLesson,
    );
    expect(canCheckAnswer(MEANING_EXERCISE, selected)).toBe(true);
  });

  it("awards feedback and decrements hearts on incorrect check", () => {
    const state = {
      ...createInitialState(MEANING_EXERCISE),
      selectedOptionId: "gohan",
    };

    const next = lessonPlayerReducer(state, { type: "CHECK" }, meaningLesson);

    expect(next.phase).toBe("feedback");
    expect(next.lastResult).toBe("incorrect");
    expect(next.hearts).toBe(4);
  });

  it("transitions to complete after final continue", () => {
    const lastExercise = MEANING_EXERCISE_2;
    const state = {
      ...createInitialState(lastExercise),
      exerciseIndex: 0,
      phase: "feedback" as const,
      lastResult: "correct" as const,
      selectedOptionId: lastExercise.correctOptionId,
    };

    const next = lessonPlayerReducer(state, { type: "CONTINUE" }, [lastExercise]);
    expect(next.phase).toBe("complete");
  });
});
