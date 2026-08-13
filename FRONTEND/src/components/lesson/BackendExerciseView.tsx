"use client";

import { useMemo } from "react";
import {
  MeaningOptions,
  MultipleChoiceOption,
} from "@/components/lesson/MultipleChoice";
import {
  AnswerLine,
  EnglishWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";
import type { AnswerRequest, ExerciseResponse } from "@/lib/api/types";

type Props = {
  exercise: ExerciseResponse;
  locked: boolean;
  showCorrect: boolean;
  correctAnswer: unknown;
  draftAnswer: AnswerRequest["answer"] | null;
  onChange: (answer: AnswerRequest["answer"]) => void;
};

export function BackendExerciseView({
  exercise,
  locked,
  showCorrect,
  correctAnswer,
  draftAnswer,
  onChange,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
      <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
        {exercise.prompt}
      </h1>
      {exercise.type === "multiple_choice" && (
        <MultipleChoiceExercise
          exercise={exercise}
          locked={locked}
          showCorrect={showCorrect}
          correctAnswer={correctAnswer}
          selected={typeof draftAnswer === "string" ? draftAnswer : null}
          onSelect={(value) => onChange(value)}
        />
      )}
      {exercise.type === "fill_blank" && (
        <FillBlankExercise
          exercise={exercise}
          locked={locked}
          showCorrect={showCorrect}
          correctAnswer={correctAnswer}
          selected={Array.isArray(draftAnswer) ? draftAnswer : []}
          onSelect={(value) => onChange(value)}
        />
      )}
      {exercise.type === "type_answer" && (
        <TypeAnswerExercise
          exercise={exercise}
          locked={locked}
          value={typeof draftAnswer === "string" ? draftAnswer : ""}
          onChange={(value) => onChange(value)}
        />
      )}
      {exercise.type === "translate" && (
        <TranslateExercise
          exercise={exercise}
          locked={locked}
          showCorrect={showCorrect}
          correctAnswer={correctAnswer}
          draftAnswer={Array.isArray(draftAnswer) ? draftAnswer : []}
          onChange={(value) => onChange(value)}
        />
      )}
      {exercise.type === "match_pairs" && (
        <MatchPairsExercise
          exercise={exercise}
          locked={locked}
          draftAnswer={
            draftAnswer && typeof draftAnswer === "object" && !Array.isArray(draftAnswer)
              ? draftAnswer
              : {}
          }
          onChange={(value) => onChange(value)}
        />
      )}
    </div>
  );
}

function MultipleChoiceExercise({
  exercise,
  locked,
  showCorrect,
  correctAnswer,
  selected,
  onSelect,
}: {
  exercise: ExerciseResponse;
  locked: boolean;
  showCorrect: boolean;
  correctAnswer: unknown;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  const options = (exercise.data.options as string[] | undefined) ?? [];

  return (
    <MeaningOptions>
      {options.map((option, index) => (
        <MultipleChoiceOption
          key={option}
          number={index + 1}
          romaji=""
          japanese={option}
          selected={selected === option}
          correct={showCorrect && option === correctAnswer}
          disabled={locked}
          onClick={() => onSelect(option)}
        />
      ))}
    </MeaningOptions>
  );
}

function FillBlankExercise({
  exercise,
  locked,
  showCorrect,
  correctAnswer,
  selected,
  onSelect,
}: {
  exercise: ExerciseResponse;
  locked: boolean;
  showCorrect: boolean;
  correctAnswer: unknown;
  selected: string[];
  onSelect: (value: string[]) => void;
}) {
  const sentence = String(exercise.data.sentence ?? "");
  const options = (exercise.data.options as string[] | undefined) ?? [];
  const blankCount = (sentence.match(/_/g) ?? []).length || 1;
  const correctList = Array.isArray(correctAnswer) ? correctAnswer.map(String) : [];

  return (
    <div className="w-full max-w-[560px]">
      <p className="mb-8 text-center text-[32px] font-extrabold text-white">{sentence}</p>
      <div className="mb-6 flex min-h-[48px] flex-wrap justify-center gap-2">
        {Array.from({ length: blankCount }).map((_, index) => (
          <span
            key={index}
            className={`rounded-xl border-2 px-4 py-2 text-[20px] font-bold ${
              showCorrect && correctList[index] === selected[index]
                ? "border-[#58cc02] text-[#58cc02]"
                : showCorrect && selected[index]
                  ? "border-[#ff4b4b] text-[#ff4b4b]"
                  : "border-[#52656d] text-white"
            }`}
          >
            {selected[index] ?? "?"}
          </span>
        ))}
      </div>
      <WordBank>
        {options.map((option) => {
          const usedCount = selected.filter((value) => value === option).length;
          const availableCount = options.filter((value) => value === option).length;
          const disabled = locked || usedCount >= availableCount;
          return (
            <EnglishWordTile
              key={option}
              word={option}
              disabled={disabled}
              onClick={() => {
                const next = [...selected];
                while (next.length < blankCount) next.push("");
                const emptyIndex = next.findIndex((value) => !value);
                if (emptyIndex === -1) return;
                next[emptyIndex] = option;
                onSelect(next.slice(0, blankCount));
              }}
            />
          );
        })}
      </WordBank>
    </div>
  );
}

function TypeAnswerExercise({
  exercise,
  locked,
  value,
  onChange,
}: {
  exercise: ExerciseResponse;
  locked: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const placeholder = String(exercise.data.placeholder ?? exercise.data.hint ?? "Type your answer");

  return (
    <input
      type="text"
      value={value}
      disabled={locked}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full max-w-[560px] rounded-2xl border-2 border-[#52656d] bg-[#202f36] px-5 py-4 text-[20px] font-bold text-white outline-none focus:border-[#1cb0f6] disabled:opacity-60"
    />
  );
}

function TranslateExercise({
  exercise,
  locked,
  showCorrect,
  correctAnswer,
  draftAnswer,
  onChange,
}: {
  exercise: ExerciseResponse;
  locked: boolean;
  showCorrect: boolean;
  correctAnswer: unknown;
  draftAnswer: string[];
  onChange: (value: string[]) => void;
}) {
  const wordBank = (exercise.data.word_bank as string[] | undefined) ?? [];
  const bankRemaining = useMemo(() => {
    const remaining = [...wordBank];
    for (const word of draftAnswer) {
      const index = remaining.indexOf(word);
      if (index !== -1) remaining.splice(index, 1);
    }
    return remaining;
  }, [draftAnswer, wordBank]);

  const correctList = Array.isArray(correctAnswer) ? correctAnswer.map(String) : [];

  return (
    <>
      <AnswerLine>
        {draftAnswer.map((word, index) => (
          <EnglishWordTile
            key={`${word}-${index}`}
            word={word}
            disabled={locked}
            onClick={() => {
              const next = [...draftAnswer];
              next.splice(index, 1);
              onChange(next);
            }}
          />
        ))}
        {showCorrect &&
          correctList.map((word, index) => (
            <EnglishWordTile key={`correct-${word}-${index}`} word={word} disabled />
          ))}
      </AnswerLine>
      <WordBank>
        {bankRemaining.map((word, index) => (
          <EnglishWordTile
            key={`${word}-${index}`}
            word={word}
            disabled={locked}
            onClick={() => onChange([...draftAnswer, word])}
          />
        ))}
      </WordBank>
    </>
  );
}

function MatchPairsExercise({
  exercise,
  locked,
  draftAnswer,
  onChange,
}: {
  exercise: ExerciseResponse;
  locked: boolean;
  draftAnswer: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  const pairs = (exercise.data.pairs as Array<{ id: string; left: string }> | undefined) ?? [];
  const rightOptions =
    (exercise.data.right_options as Array<{ id: string; right: string }> | undefined) ?? [];

  return (
    <div className="flex w-full max-w-[560px] flex-col gap-4">
      {pairs.map((pair) => (
        <div key={pair.id} className="flex items-center gap-3">
          <span className="min-w-[120px] text-[18px] font-bold text-white">{pair.left}</span>
          <select
            disabled={locked}
            value={draftAnswer[pair.id] ?? ""}
            onChange={(event) =>
              onChange({ ...draftAnswer, [pair.id]: event.target.value })
            }
            className="flex-1 rounded-xl border-2 border-[#52656d] bg-[#202f36] px-3 py-2 text-white"
          >
            <option value="">Select match</option>
            {rightOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.right}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
