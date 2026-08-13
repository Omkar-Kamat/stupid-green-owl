"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CorrectFeedbackBar,
  IncorrectFeedbackBar,
} from "@/components/lesson/FeedbackBar";
import { CheckButton, LessonActionFooter } from "@/components/lesson/LessonFooter";
import { LessonShell } from "@/components/lesson/LessonShell";
import { BackendExerciseView } from "@/components/lesson/BackendExerciseView";
import { useOptionalUserStats } from "@/components/providers/UserStatsProvider";
import { lessonApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type {
  AnswerRequest,
  CompleteResponse,
  ExerciseResponse,
  StartLessonResponse,
} from "@/lib/api/types";

type LessonPhase = "loading" | "answering" | "submitting" | "feedback" | "complete" | "failed" | "error";

type PlayerState = {
  phase: LessonPhase;
  attemptId: number | null;
  exercises: ExerciseResponse[];
  exerciseIndex: number;
  hearts: number;
  lastResult: "correct" | "incorrect" | null;
  correctAnswer: unknown;
  completeResult: CompleteResponse | null;
  error: string | null;
  draftAnswer: AnswerRequest["answer"] | null;
};

function initialState(): PlayerState {
  return {
    phase: "loading",
    attemptId: null,
    exercises: [],
    exerciseIndex: 0,
    hearts: 5,
    lastResult: null,
    correctAnswer: null,
    completeResult: null,
    error: null,
    draftAnswer: null,
  };
}

function progressPercent(index: number, total: number, phase: LessonPhase): number {
  if (total === 0) return 0;
  const base = (index / total) * 100;
  if (phase === "feedback" || phase === "complete") {
    return Math.min(100, base + 100 / total);
  }
  return base;
}

function formatCorrectAnswer(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ApiLessonPlayer({ lessonId }: { lessonId: number }) {
  const statsContext = useOptionalUserStats();
  const [state, setState] = useState<PlayerState>(initialState);

  const refreshStats = statsContext?.refresh;

  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      setState(initialState());
      try {
        const data = await lessonApi.start(lessonId);
        if (cancelled) return;
        setState({
          phase: "answering",
          attemptId: data.attempt_id,
          exercises: data.exercises,
          exerciseIndex: data.current_exercise_index,
          hearts: data.hearts_remaining,
          lastResult: null,
          correctAnswer: null,
          completeResult: null,
          error: null,
          draftAnswer: null,
        });
        void refreshStats?.();
      } catch (err) {
        if (cancelled) return;
        setState({
          ...initialState(),
          phase: "error",
          error: getApiErrorMessage(err),
        });
      }
    }

    void loadLesson();
    return () => {
      cancelled = true;
    };
  }, [lessonId, refreshStats]);

  const retryStartLesson = useCallback(async () => {
    setState(initialState());
    try {
      const data = await lessonApi.start(lessonId);
      setState({
        phase: "answering",
        attemptId: data.attempt_id,
        exercises: data.exercises,
        exerciseIndex: data.current_exercise_index,
        hearts: data.hearts_remaining,
        lastResult: null,
        correctAnswer: null,
        completeResult: null,
        error: null,
        draftAnswer: null,
      });
      void refreshStats?.();
    } catch (err) {
      setState({
        ...initialState(),
        phase: "error",
        error: getApiErrorMessage(err),
      });
    }
  }, [lessonId, refreshStats]);

  const exercise = state.exercises[state.exerciseIndex];
  const total = state.exercises.length;
  const progress = progressPercent(state.exerciseIndex, total, state.phase);
  const locked = state.phase === "feedback" || state.phase === "submitting";

  const canSubmit = useMemo(() => {
    if (state.phase !== "answering" || !exercise) return false;
    if (state.draftAnswer === null) return false;
    if (typeof state.draftAnswer === "string") return state.draftAnswer.trim().length > 0;
    if (Array.isArray(state.draftAnswer)) return state.draftAnswer.length > 0;
    if (typeof state.draftAnswer === "object") return Object.keys(state.draftAnswer).length > 0;
    return false;
  }, [state.phase, state.draftAnswer, exercise]);

  const handleSubmit = useCallback(async () => {
    if (!exercise || state.attemptId === null || state.draftAnswer === null || !canSubmit) return;

    setState((prev) => ({ ...prev, phase: "submitting" }));

    try {
      const response = await lessonApi.answer(state.attemptId, {
        exercise_id: exercise.id,
        answer: state.draftAnswer,
      });

      void refreshStats?.();

      if (response.lesson_failed) {
        setState((prev) => ({
          ...prev,
          phase: "failed",
          hearts: response.hearts_remaining,
          lastResult: "incorrect",
          correctAnswer: response.correct_answer,
        }));
        return;
      }


      setState((prev) => ({
        ...prev,
        phase: "feedback",
        hearts: response.hearts_remaining,
        lastResult: response.correct ? "correct" : "incorrect",
        correctAnswer: response.correct_answer,
        exerciseIndex: response.correct ? response.next_exercise_index : prev.exerciseIndex,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        phase: "answering",
        error: getApiErrorMessage(err),
      }));
    }
  }, [canSubmit, exercise, refreshStats, state.attemptId, state.draftAnswer, total]);

  const handleContinue = useCallback(async () => {
    if (state.phase !== "feedback" || state.attemptId === null) return;

    if (state.exerciseIndex >= total) {
      try {
        const completeResult = await lessonApi.complete(state.attemptId);
        void refreshStats?.();
        setState((prev) => ({
          ...prev,
          phase: "complete",
          completeResult,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          phase: "error",
          error: getApiErrorMessage(err, "Could not complete the lesson."),
        }));
      }
      return;
    }

    setState((prev) => ({
      ...prev,
      phase: "answering",
      lastResult: null,
      correctAnswer: null,
      draftAnswer: null,
      error: null,
    }));
  }, [refreshStats, state.attemptId, state.exerciseIndex, state.phase, total]);

  if (state.phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#131f24] font-duo text-white">
        <p className="text-lg font-bold text-[#afafaf]">Loading lesson…</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#131f24] px-6 font-duo text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold">Could not load lesson</h1>
          <p className="mt-3 text-[#afafaf]">{state.error}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void retryStartLesson()}
              className="inline-flex rounded-2xl border-2 border-b-4 border-[#1899d6] bg-[#1cb0f6] px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-white"
            >
              Try again
            </button>
            <Link
              href="/learn/japanese"
              className="inline-flex rounded-2xl border-2 border-b-4 border-[#52656d] bg-[#37464f] px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-white"
            >
              Back to path
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === "complete") {
    const xp = state.completeResult?.xp_awarded ?? 0;
    const streak = state.completeResult?.streak ?? 0;
    const crown = state.completeResult?.crown_earned ?? false;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#131f24] px-6 font-duo text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#58cc02]">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-white" fill="currentColor" aria-hidden="true">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold">Lesson complete!</h1>
          <p className="mt-3 text-[#afafaf]">
            +{xp} XP · {streak} day streak
            {crown ? " · Crown earned!" : ""}
          </p>
          <Link
            href="/learn/japanese"
            className="mt-8 inline-flex rounded-2xl border-2 border-b-4 border-[#46a302] bg-[#58cc02] px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-wide text-[#131f24] transition-all hover:brightness-110 active:border-b-2 active:translate-y-[2px]"
          >
            Continue
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === "failed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#131f24] px-6 font-duo text-white">
        <div className="max-w-md text-center">
          <img
            src="/illustrations/heart.svg"
            alt=""
            width={64}
            height={64}
            className="mx-auto mb-6 h-16 w-16 opacity-50"
          />
          <h1 className="text-3xl font-extrabold">Out of hearts</h1>
          <p className="mt-3 text-[#afafaf]">
            Visit the shop to refill hearts and try again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/learn/japanese/shop"
              className="inline-flex rounded-2xl border-2 border-b-4 border-[#1899d6] bg-[#1cb0f6] px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-white"
            >
              Go to shop
            </Link>
            <Link
              href="/learn/japanese"
              className="inline-flex rounded-2xl border-2 border-b-4 border-[#52656d] bg-[#37464f] px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-white"
            >
              Back to path
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise && state.phase !== "feedback") return null;

  const displayExercise =
    exercise ?? state.exercises[Math.min(state.exerciseIndex, total - 1)];

  const footer =
    state.phase === "feedback" ? (
      state.lastResult === "correct" ? (
        <CorrectFeedbackBar message="Excellent!" onContinue={handleContinue} />
      ) : (
        <IncorrectFeedbackBar
          romaji="Correct answer"
          japanese={formatCorrectAnswer(state.correctAnswer)}
          meaning="Keep going!"
          onContinue={handleContinue}
        />
      )
    ) : (
      <LessonActionFooter
        right={
          <CheckButton
            disabled={!canSubmit || state.phase === "submitting"}
            onClick={() => void handleSubmit()}
          />
        }
      />
    );

  return (
    <LessonShell progress={progress} hearts={state.hearts} footer={footer}>
      {state.error && (
        <p className="mb-4 text-center text-sm font-bold text-[#ff4b4b]">{state.error}</p>
      )}
      <BackendExerciseView
        exercise={displayExercise}
        locked={locked}
        showCorrect={locked && state.lastResult === "incorrect"}
        correctAnswer={state.correctAnswer}
        draftAnswer={state.draftAnswer}
        onChange={(answer) =>
          setState((prev) => ({ ...prev, draftAnswer: answer, error: null }))
        }
      />
    </LessonShell>
  );
}
