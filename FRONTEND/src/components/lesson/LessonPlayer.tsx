"use client";

/**
 * UI prototype lesson player — local demo exercises only.
 * The production learner journey uses ApiLessonPlayer (/lesson/[lessonId]).
 */
import Link from "next/link";
import { useReducer, useCallback, useRef, type Dispatch } from "react";
import type {
  DemoExercise,
  ListeningExercise,
  MeaningExercise,
  TranslateExercise,
} from "@/data/demoExercises";
import {
  CorrectFeedbackBar,
  IncorrectFeedbackBar,
} from "@/components/lesson/FeedbackBar";
import {
  BearCharacter,
  ElderCharacter,
  FuriganaText,
  LucyCharacter,
  SpeechBubble,
} from "@/components/lesson/LessonCharacters";
import {
  CantListenButton,
  CheckButton,
  LessonActionFooter,
  SkipButton,
  UseKeyboardButton,
} from "@/components/lesson/LessonFooter";
import { LessonShell } from "@/components/lesson/LessonShell";
import {
  MeaningOptions,
  MultipleChoiceOption,
} from "@/components/lesson/MultipleChoice";
import {
  AnswerLine,
  AudioButtons,
  EnglishWordTile,
  JapaneseWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";
import {
  canCheckAnswer,
  createInitialState,
  lessonPlayerReducer,
  progressPercent,
  type LessonPlayerState,
} from "@/lib/lessonPlayerReducer";
import { incrementUnitProgress } from "@/lib/unitProgress";

const ACTIVE_UNIT_ID = "section-1-unit-1";

export function LessonPlayer({
  exercises,
  unitId = ACTIVE_UNIT_ID,
}: {
  exercises: DemoExercise[];
  unitId?: string;
}) {
  const [state, dispatch] = useReducer(
    (s: LessonPlayerState, action: Parameters<typeof lessonPlayerReducer>[1]) =>
      lessonPlayerReducer(s, action, exercises),
    exercises[0],
    (first) => createInitialState(first),
  );

  const creditedRef = useRef<Set<number>>(new Set());

  const exercise = exercises[state.exerciseIndex];
  const locked = state.phase === "feedback";
  const checkEnabled = exercise ? canCheckAnswer(exercise, state) : false;
  const progress = progressPercent(
    state.exerciseIndex,
    exercises.length,
    state.phase,
  );
  const streakLabel =
    state.correctStreak >= 2 ? `${state.correctStreak} IN A ROW` : undefined;

  const handleContinue = useCallback(() => {
    if (
      state.lastResult === "correct" &&
      !creditedRef.current.has(state.exerciseIndex)
    ) {
      creditedRef.current.add(state.exerciseIndex);
      incrementUnitProgress(unitId);
    }
    dispatch({ type: "CONTINUE" });
  }, [state.exerciseIndex, state.lastResult, unitId]);

  if (!exercise) return null;

  if (state.phase === "complete") {
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
            You finished {exercises.length} questions with {state.hearts} hearts
            remaining.
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

  if (state.hearts === 0 && state.phase === "feedback" && state.lastResult === "incorrect") {
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

  const footer =
    state.phase === "feedback" ? (
      state.lastResult === "correct" ? (
        <CorrectFeedbackBar message="Excellent!" onContinue={handleContinue} />
      ) : exercise.type === "listening" ? (
        <IncorrectFeedbackBar
          romaji={exercise.incorrectFeedback.romaji}
          japanese={exercise.incorrectFeedback.japanese}
          meaning={exercise.incorrectFeedback.meaning}
          onContinue={handleContinue}
        />
      ) : (
        <IncorrectFeedbackBar
          romaji="Correct answer required"
          japanese=""
          meaning="Try again on the next question."
          onContinue={handleContinue}
        />
      )
    ) : exercise.type === "listening" ? (
      <LessonActionFooter
        left={<CantListenButton />}
        center={<UseKeyboardButton />}
        right={
          <CheckButton
            disabled={!checkEnabled}
            onClick={() => dispatch({ type: "CHECK" })}
          />
        }
      />
    ) : (
      <LessonActionFooter
        left={<SkipButton onClick={() => dispatch({ type: "SKIP" })} />}
        right={
          <CheckButton
            disabled={!checkEnabled}
            onClick={() => dispatch({ type: "CHECK" })}
          />
        }
      />
    );

  return (
    <LessonShell
      progress={progress}
      hearts={state.hearts}
      streakLabel={streakLabel}
      footer={footer}
    >
      {exercise.type === "listening" && (
        <ListeningView
          exercise={exercise}
          state={state}
          locked={locked}
          dispatch={dispatch}
        />
      )}
      {exercise.type === "translate" && (
        <TranslateView
          exercise={exercise}
          state={state}
          locked={locked}
          dispatch={dispatch}
        />
      )}
      {exercise.type === "meaning" && (
        <MeaningView
          exercise={exercise}
          state={state}
          locked={locked}
          dispatch={dispatch}
        />
      )}
    </LessonShell>
  );
}

function tileMap(exercise: ListeningExercise | TranslateExercise) {
  return Object.fromEntries(exercise.bank.map((tile) => [tile.id, tile]));
}

function ListeningView({
  exercise,
  state,
  locked,
  dispatch,
}: {
  exercise: ListeningExercise;
  state: LessonPlayerState;
  locked: boolean;
  dispatch: Dispatch<Parameters<typeof lessonPlayerReducer>[1]>;
}) {
  const tiles = tileMap(exercise);

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col items-center">
      <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
        {exercise.title}
      </h1>
      <AudioButtons />
      <AnswerLine>
        {state.answerOrder.map((id, index) => {
          const tile = tiles[id];
          if (!tile) return null;
          return (
            <JapaneseWordTile
              key={`${id}-${index}`}
              romaji={tile.romaji}
              japanese={tile.japanese}
              selected
              disabled={locked}
              onClick={() =>
                dispatch({ type: "TAP_ANSWER", tileId: id, index })
              }
            />
          );
        })}
      </AnswerLine>
      <WordBank>
        {state.bankOrder.map((id) => {
          const tile = tiles[id];
          if (!tile) return null;
          return (
            <JapaneseWordTile
              key={id}
              romaji={tile.romaji}
              japanese={tile.japanese}
              disabled={locked}
              onClick={() => dispatch({ type: "TAP_BANK", tileId: id })}
            />
          );
        })}
        {Array.from({ length: Math.max(0, 4 - state.bankOrder.length) }).map(
          (_, i) => (
            <JapaneseWordTile key={`empty-${i}`} empty />
          ),
        )}
      </WordBank>
    </div>
  );
}

function TranslateView({
  exercise,
  state,
  locked,
  dispatch,
}: {
  exercise: TranslateExercise;
  state: LessonPlayerState;
  locked: boolean;
  dispatch: Dispatch<Parameters<typeof lessonPlayerReducer>[1]>;
}) {
  const tiles = tileMap(exercise);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
      <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
        {exercise.title}
      </h1>
      <div className="mb-10 flex w-full items-center justify-center gap-4">
        <BearCharacter />
        <SpeechBubble>
          <FuriganaText segments={exercise.segments} />
        </SpeechBubble>
      </div>
      <AnswerLine>
        {state.answerOrder.map((id, index) => {
          const tile = tiles[id];
          if (!tile) return null;
          return (
            <EnglishWordTile
              key={`${id}-${index}`}
              word={tile.word}
              disabled={locked}
              onClick={() =>
                dispatch({ type: "TAP_ANSWER", tileId: id, index })
              }
            />
          );
        })}
      </AnswerLine>
      <WordBank>
        {state.bankOrder.map((id) => {
          const tile = tiles[id];
          if (!tile) return null;
          return (
            <EnglishWordTile
              key={id}
              word={tile.word}
              disabled={locked}
              onClick={() => dispatch({ type: "TAP_BANK", tileId: id })}
            />
          );
        })}
        {Array.from({ length: Math.max(0, 5 - state.bankOrder.length) }).map(
          (_, i) => (
            <EnglishWordTile key={`empty-${i}`} empty />
          ),
        )}
      </WordBank>
    </div>
  );
}

function MeaningView({
  exercise,
  state,
  locked,
  dispatch,
}: {
  exercise: MeaningExercise;
  state: LessonPlayerState;
  locked: boolean;
  dispatch: Dispatch<Parameters<typeof lessonPlayerReducer>[1]>;
}) {
  const Character = exercise.character === "lucy" ? LucyCharacter : ElderCharacter;
  const showCorrect =
    locked && state.lastResult === "incorrect";

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
      <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
        {exercise.title}
      </h1>
      <div className="mb-10 flex w-full items-center justify-center gap-4">
        <Character />
        <SpeechBubble showSpeaker={false}>
          <p className="text-[22px] font-bold text-white">{exercise.prompt}</p>
        </SpeechBubble>
      </div>
      <MeaningOptions>
        {exercise.options.map((option, index) => (
          <MultipleChoiceOption
            key={option.id}
            number={index + 1}
            romaji={option.romaji}
            japanese={option.japanese}
            selected={state.selectedOptionId === option.id}
            correct={
              showCorrect && option.id === exercise.correctOptionId
            }
            disabled={locked}
            onClick={() =>
              dispatch({ type: "SELECT_OPTION", optionId: option.id })
            }
          />
        ))}
      </MeaningOptions>
    </div>
  );
}
