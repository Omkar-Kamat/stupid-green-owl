import type { DemoExercise } from "@/data/demoExercises";

export type LessonPhase = "answering" | "feedback" | "complete";

export type LessonPlayerState = {
  exerciseIndex: number;
  phase: LessonPhase;
  hearts: number;
  correctStreak: number;
  answerOrder: string[];
  bankOrder: string[];
  selectedOptionId: string | null;
  lastResult: "correct" | "incorrect" | null;
};

export type LessonPlayerAction =
  | { type: "TAP_BANK"; tileId: string }
  | { type: "TAP_ANSWER"; tileId: string; index: number }
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "CHECK" }
  | { type: "CONTINUE" }
  | { type: "SKIP" };

function bankIdsForExercise(exercise: DemoExercise): string[] {
  if (exercise.type === "meaning") return [];
  return exercise.bank.map((tile) => tile.id);
}

function isAnswerCorrect(exercise: DemoExercise, state: LessonPlayerState): boolean {
  if (exercise.type === "meaning") {
    return state.selectedOptionId === exercise.correctOptionId;
  }
  return (
    state.answerOrder.length === exercise.correctOrder.length &&
    state.answerOrder.every((id, index) => id === exercise.correctOrder[index])
  );
}

function canCheck(exercise: DemoExercise, state: LessonPlayerState): boolean {
  if (state.phase !== "answering") return false;
  if (exercise.type === "meaning") return state.selectedOptionId !== null;
  return state.answerOrder.length === exercise.correctOrder.length;
}

export function createInitialState(
  exercise: DemoExercise,
  hearts = 5,
): LessonPlayerState {
  return {
    exerciseIndex: 0,
    phase: "answering",
    hearts,
    correctStreak: 0,
    answerOrder: [],
    bankOrder: bankIdsForExercise(exercise),
    selectedOptionId: null,
    lastResult: null,
  };
}

export function lessonPlayerReducer(
  state: LessonPlayerState,
  action: LessonPlayerAction,
  exercises: DemoExercise[],
): LessonPlayerState {
  const exercise = exercises[state.exerciseIndex];
  if (!exercise) return state;

  switch (action.type) {
    case "TAP_BANK": {
      if (state.phase !== "answering" || exercise.type === "meaning") return state;
      if (!state.bankOrder.includes(action.tileId)) return state;
      return {
        ...state,
        bankOrder: state.bankOrder.filter((id) => id !== action.tileId),
        answerOrder: [...state.answerOrder, action.tileId],
      };
    }
    case "TAP_ANSWER": {
      if (state.phase !== "answering" || exercise.type === "meaning") return state;
      if (state.answerOrder[action.index] !== action.tileId) return state;
      const answerOrder = [...state.answerOrder];
      answerOrder.splice(action.index, 1);
      return {
        ...state,
        answerOrder,
        bankOrder: [...state.bankOrder, action.tileId],
      };
    }
    case "SELECT_OPTION": {
      if (state.phase !== "answering" || exercise.type !== "meaning") return state;
      return { ...state, selectedOptionId: action.optionId };
    }
    case "CHECK": {
      if (!canCheck(exercise, state)) return state;
      const correct = isAnswerCorrect(exercise, state);
      return {
        ...state,
        phase: "feedback",
        lastResult: correct ? "correct" : "incorrect",
        hearts: correct ? state.hearts : Math.max(0, state.hearts - 1),
        correctStreak: correct ? state.correctStreak + 1 : 0,
      };
    }
    case "SKIP": {
      if (state.phase !== "answering") return state;
      return {
        ...state,
        phase: "feedback",
        lastResult: "incorrect",
        hearts: Math.max(0, state.hearts - 1),
        correctStreak: 0,
      };
    }
    case "CONTINUE": {
      if (state.phase !== "feedback") return state;
      const nextIndex = state.exerciseIndex + 1;
      if (nextIndex >= exercises.length) {
        return { ...state, phase: "complete" };
      }
      const nextExercise = exercises[nextIndex];
      return {
        ...state,
        exerciseIndex: nextIndex,
        phase: "answering",
        answerOrder: [],
        bankOrder: bankIdsForExercise(nextExercise),
        selectedOptionId: null,
        lastResult: null,
      };
    }
    default:
      return state;
  }
}

export function canCheckAnswer(
  exercise: DemoExercise,
  state: LessonPlayerState,
): boolean {
  return canCheck(exercise, state);
}

export function progressPercent(
  exerciseIndex: number,
  total: number,
  phase: LessonPhase,
): number {
  if (total === 0) return 0;
  const base = (exerciseIndex / total) * 100;
  if (phase === "feedback" || phase === "complete") {
    return Math.min(100, base + 100 / total);
  }
  return base;
}
