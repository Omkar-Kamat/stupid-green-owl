import { ApiError } from "@/lib/api-client";

const ERROR_MESSAGES: Record<string, string> = {
  SKILL_LOCKED: "This skill is locked. Complete the previous skill first.",
  LESSON_NOT_FOUND: "Lesson not found.",
  ATTEMPT_NOT_FOUND: "Lesson attempt not found.",
  ATTEMPT_ALREADY_TERMINATED: "This lesson attempt has already ended.",
  EXERCISE_NOT_CURRENT: "Please answer the current exercise.",
  EXERCISE_ALREADY_ANSWERED: "You already answered this exercise.",
  LESSON_INCOMPLETE: "Finish all exercises before completing the lesson.",
  HEARTS_ALREADY_FULL: "Your hearts are already full.",
  NOT_ENOUGH_GEMS: "Not enough gems for this purchase.",
  INVALID_ANSWER_PAYLOAD: "Invalid answer format.",
  USER_NOT_FOUND: "User not found.",
  USER_STATS_NOT_FOUND: "User stats not found.",
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] ?? error.code.replace(/_/g, " ").toLowerCase();
  }
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Cannot reach the server. Make sure the backend is running.";
  }
  return fallback;
}
