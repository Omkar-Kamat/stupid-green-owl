"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_UNIT,
  unitProgressPercent,
  type LessonNode,
  type Unit,
} from "@/data/courseStructure";
import {
  activeLessonIndex,
  getUnitProgressWithDemo,
  lessonState,
  unitRingProgress,
  type UnitProgress,
} from "@/lib/unitProgress";

const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function LearningPath({
  unit = DEFAULT_UNIT,
}: {
  unit?: Unit;
}) {
  const [progress, setProgress] = useState<UnitProgress | null>(null);

  useEffect(() => {
    setProgress(getUnitProgressWithDemo(unit.id));
  }, [unit.id]);

  const activeIndex = progress ? activeLessonIndex(progress) : 0;
  const nextUnit = unit.unitNumber < 5 ? unit.unitNumber + 1 : null;

  return (
    <div className="flex min-h-full flex-col">
      <UnitBanner unit={unit} progress={progress} />

      <div className="relative mx-auto flex w-full max-w-[720px] justify-center px-4 pb-20 pt-16 sm:px-6">
        <div className="relative flex w-[260px] shrink-0 flex-col items-center gap-10">
          {unit.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="relative flex w-full justify-center"
              style={{ transform: `translateX(${lesson.offset}px)` }}
            >
              {index === activeIndex && progress && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[13px] font-extrabold uppercase tracking-wider text-[#6b6b6b]">
                  {index === 0 ? "Start" : "Continue"}
                </span>
              )}
              <PathNode
                lesson={lesson}
                state={progress ? lessonState(progress, index) : index === 0 ? "active" : "locked"}
                ringProgress={
                  progress && lessonState(progress, index) === "active"
                    ? unitRingProgress(progress, unit)
                    : progress && lessonState(progress, index) === "complete"
                      ? 100
                      : 0
                }
              />
            </div>
          ))}

          {nextUnit && (
            <div className="mt-4 w-full pt-6">
              <div className="mb-10 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#37464f]" />
                <span className="shrink-0 text-center text-[13px] font-extrabold uppercase tracking-wide text-[#52656d]">
                  {unit.sectionNumber === 1 && nextUnit === 2
                    ? "Describe people"
                    : `Unit ${nextUnit}`}
                </span>
                <div className="h-px flex-1 bg-[#37464f]" />
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden w-[360px] shrink-0 sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/path-owl.svg"
            alt=""
            width={360}
            height={360}
            className="pointer-events-none absolute -left-4 top-[168px] h-[360px] w-[360px]"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function UnitBanner({
  unit,
  progress,
}: {
  unit: Unit;
  progress: UnitProgress | null;
}) {
  const pct = progress
    ? Math.round(unitProgressPercent(progress.completedQuestions))
    : 0;

  return (
    <div className="px-4 pt-8 pb-4 md:px-6">
      <div className="w-full rounded-2xl bg-duo-green shadow-[0_4px_0_#3d3d3d]">
        <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-6">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wider text-white/75">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/back-arrow.svg"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
                aria-hidden
              />
              Section {unit.sectionNumber}, Unit {unit.unitNumber}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold leading-tight text-white md:text-2xl">
              {unit.title}
            </h2>
            {progress && (
              <p className="mt-1 text-[13px] font-bold text-white/70">
                {progress.completedQuestions} / {unit.lessons.length * 10} questions · {pct}%
              </p>
            )}
          </div>
          <Link
            href="/learn/japanese/guidebook"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-b-4 border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white transition-all hover:bg-white/20 active:border-b-2 active:translate-y-[2px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/guidebook.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
              aria-hidden
            />
            Guidebook
          </Link>
        </div>
      </div>
    </div>
  );
}

function PathNode({
  lesson,
  state,
  ringProgress,
}: {
  lesson: LessonNode;
  state: "locked" | "active" | "complete";
  ringProgress: number;
}) {
  const filled = (ringProgress / 100) * RING_CIRCUMFERENCE;
  const href = state === "locked" ? undefined : "/lesson/listening/before";

  const buttonInner = (
    <>
      {state === "active" && (
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 88 88"
          aria-hidden="true"
        >
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke="#37464f"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke="#6b6b6b"
            strokeWidth="6"
            strokeDasharray={`${filled} ${RING_CIRCUMFERENCE}`}
            strokeLinecap="round"
          />
        </svg>
      )}
      {state === "complete" && (
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 88 88"
          aria-hidden="true"
        >
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke="#6b6b6b"
            strokeWidth="6"
          />
        </svg>
      )}
      <span
        className={`relative flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-[6px] shadow-[0_4px_0_#3d3d3d] transition-transform active:translate-y-[2px] active:border-b-[4px] active:shadow-none ${
          state === "active"
            ? "border-duo-green-dark bg-duo-green hover:scale-105"
            : state === "complete"
              ? "border-[#3d3d3d] bg-duo-green hover:scale-105"
              : "border-[#2b3a40] bg-[#37464f] shadow-[0_4px_0_#2b3a40]"
        }`}
      >
        {lesson.type === "star" || lesson.type === "start" ? (
          <StarIcon muted={state === "locked"} />
        ) : null}
        {lesson.type === "chest" && <ChestIcon />}
        {lesson.type === "trophy" && <TrophyIcon />}
      </span>
    </>
  );

  if (state === "active" || state === "complete") {
    return (
      <div className="relative flex h-[88px] w-[88px] items-center justify-center">
        {href ? (
          <Link href={href} className="relative flex h-full w-full items-center justify-center" aria-label={lesson.title}>
            {buttonInner}
          </Link>
        ) : (
          buttonInner
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-[6px] border-[#2b3a40] bg-[#37464f] shadow-[0_4px_0_#2b3a40]"
      aria-label={`${lesson.title} (locked)`}
    >
      {lesson.type === "star" || lesson.type === "start" ? (
        <StarIcon muted />
      ) : null}
      {lesson.type === "chest" && <ChestIcon />}
      {lesson.type === "trophy" && <TrophyIcon />}
    </button>
  );
}

function StarIcon({ muted = false }: { muted?: boolean }) {
  const fill = muted ? "#52656d" : "white";
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill={fill}
        d="M12 2l2.9 6.5L22 9.5l-5 4.8 1.2 6.9L12 17.8 5.8 21.2 7 14.3 2 9.5l7.1-1L12 2z"
      />
    </svg>
  );
}

function ChestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path fill="#52656d" d="M4 8h16v11H4V8zm2-5h12v5H6V3zm4 9v3h4v-3h-4z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill="#52656d"
        d="M6 4h12v3c0 3.3-2.3 6.1-5.5 6.8V17h3v2H8v-2h3v-3.2C7.3 13.1 5 10.3 5 7V4zm2 2v1c0 2.2 1.8 4 4 4s4-1.8 4-4V6H8z"
      />
    </svg>
  );
}
