import type { ExerciseResponse } from "@/lib/api/types";

function countBlankSlots(sentence: string): number {
  return (sentence.match(/_/g) ?? []).length;
}

export function isAnswerComplete(
  exercise: ExerciseResponse,
  answer: string | string[] | Record<string, string> | null,
): boolean {
  if (answer === null) return false;

  switch (exercise.type) {
    case "multiple_choice":
    case "type_answer":
      return typeof answer === "string" && answer.trim().length > 0;

    case "translate": {
      if (!Array.isArray(answer) || answer.length === 0) return false;
      if (!answer.every((word) => typeof word === "string" && word.trim().length > 0)) {
        return false;
      }
      const expected = exercise.data.expected_word_count;
      if (typeof expected === "number" && expected > 0) {
        return answer.length === expected;
      }
      return true;
    }

    case "fill_blank": {
      if (!Array.isArray(answer)) return false;
      const sentence = typeof exercise.data.sentence === "string" ? exercise.data.sentence : "";
      const required = countBlankSlots(sentence);
      return (
        required > 0 &&
        answer.length === required &&
        answer.every((part) => part.trim().length > 0)
      );
    }

    case "match_pairs": {
      if (typeof answer !== "object" || Array.isArray(answer)) return false;
      const pairs = exercise.data.pairs;
      if (!Array.isArray(pairs)) return false;
      return pairs.every((pair) => {
        const id = typeof pair === "object" && pair !== null && "id" in pair ? String(pair.id) : "";
        return id.length > 0 && typeof answer[id] === "string" && answer[id].length > 0;
      });
    }

    default:
      return false;
  }
}
