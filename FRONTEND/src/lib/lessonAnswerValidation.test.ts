import { describe, expect, it } from "vitest";
import { isAnswerComplete } from "@/lib/lessonAnswerValidation";
import type { ExerciseResponse } from "@/lib/api/types";

describe("isAnswerComplete", () => {
  it("requires all fill-blank slots", () => {
    const exercise: ExerciseResponse = {
      id: 1,
      type: "fill_blank",
      prompt: "Fill in",
      data: { sentence: "Hello _ world _" },
    };
    expect(isAnswerComplete(exercise, ["a"])).toBe(false);
    expect(isAnswerComplete(exercise, ["a", "b"])).toBe(true);
    expect(isAnswerComplete(exercise, ["a", ""])).toBe(false);
  });

  it("requires all match pairs", () => {
    const exercise: ExerciseResponse = {
      id: 2,
      type: "match_pairs",
      prompt: "Match",
      data: {
        pairs: [
          { id: "a", left: "1", right: "one" },
          { id: "b", left: "2", right: "two" },
        ],
      },
    };
    expect(isAnswerComplete(exercise, { a: "one" })).toBe(false);
    expect(isAnswerComplete(exercise, { a: "one", b: "two" })).toBe(true);
  });

  it("accepts non-empty type_answer strings", () => {
    const exercise: ExerciseResponse = {
      id: 3,
      type: "type_answer",
      prompt: "Type",
      data: {},
    };
    expect(isAnswerComplete(exercise, "  ")).toBe(false);
    expect(isAnswerComplete(exercise, "hello")).toBe(true);
  });

  it("rejects null answers for every type", () => {
    const exercise: ExerciseResponse = {
      id: 5,
      type: "multiple_choice",
      prompt: "Pick",
      data: { options: ["A", "B"] },
    };
    expect(isAnswerComplete(exercise, null)).toBe(false);
  });

  it("rejects partial multiple_choice (empty string)", () => {
    const exercise: ExerciseResponse = {
      id: 6,
      type: "multiple_choice",
      prompt: "Pick",
      data: { options: ["A", "B"] },
    };
    expect(isAnswerComplete(exercise, "")).toBe(false);
    expect(isAnswerComplete(exercise, "   ")).toBe(false);
  });

  it("rejects translate arrays containing blank words", () => {
    const exercise: ExerciseResponse = {
      id: 7,
      type: "translate",
      prompt: "Translate",
      data: { word_bank: ["a", "b"] },
    };
    expect(isAnswerComplete(exercise, ["hello", ""])).toBe(false);
  });

  it("requires expected_word_count for multi-word translate", () => {
    const exercise: ExerciseResponse = {
      id: 8,
      type: "translate",
      prompt: "Translate sentence",
      data: { word_bank: ["a", "b", "c", "d"], expected_word_count: 3 },
    };
    expect(isAnswerComplete(exercise, ["a"])).toBe(false);
    expect(isAnswerComplete(exercise, ["a", "b", "c"])).toBe(true);
  });
});
