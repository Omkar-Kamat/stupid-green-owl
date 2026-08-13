"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { pathApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { PathResponse, SkillPathResponse, UnitResponse } from "@/lib/api/types";

const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const UNIT_OFFSETS = [0, 56, -56, 56, 0];

/**
 * Seed data creates one lesson per skill with matching numeric ids (skill 1 → lesson 1).
 * Backend path only returns skill ids; there is no skill→lesson lookup endpoint yet.
 */
function lessonHrefForSkill(skillId: number): string {
  return `/lesson/${skillId}`;
}

export function LearningPath() {
  const [path, setPath] = useState<PathResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pathApi.getPath();
      setPath(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPath();
  }, [loadPath]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <p className="text-[15px] font-bold text-[#afafaf]">Loading path…</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-[15px] font-bold text-[#ff4b4b]">
          {error ?? "Could not load learning path."}
        </p>
        <button
          type="button"
          onClick={() => void loadPath()}
          className="rounded-2xl border-2 border-b-4 border-[#1899d6] bg-[#1cb0f6] px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const flatSkills = path.units.flatMap((unit, unitIndex) =>
    unit.skills.map((skill, skillIndex) => ({
      unit,
      skill,
      unitIndex,
      skillIndex,
      globalIndex: path.units
        .slice(0, unitIndex)
        .reduce((sum, current) => sum + current.skills.length, 0) + skillIndex,
    })),
  );

  const activeSkillIndex = flatSkills.findIndex(
    (item) => item.skill.status === "available",
  );
  const activeItem = activeSkillIndex >= 0 ? flatSkills[activeSkillIndex] : flatSkills[0];

  return (
    <div className="flex min-h-full flex-col">
      {activeItem && (
        <UnitBanner unit={activeItem.unit} skill={activeItem.skill} unitNumber={activeItem.unitIndex + 1} />
      )}

      <div className="relative mx-auto flex w-full max-w-[720px] justify-center px-4 pb-20 pt-16 sm:px-6">
        <div className="relative flex w-[260px] shrink-0 flex-col items-center gap-10">
          {flatSkills.map((item, index) => {
            const state = skillNodeState(item.skill, index, activeSkillIndex);
            const ringProgress =
              item.skill.status === "completed"
                ? 100
                : state === "active"
                  ? 50
                  : 0;

            return (
              <div
                key={item.skill.id}
                className="relative flex w-full justify-center"
                style={{
                  transform: `translateX(${UNIT_OFFSETS[item.globalIndex % UNIT_OFFSETS.length]}px)`,
                }}
              >
                {index === activeSkillIndex && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[13px] font-extrabold uppercase tracking-wider text-[#6b6b6b]">
                    {index === 0 ? "Start" : "Continue"}
                  </span>
                )}
                <SkillPathNode
                  skill={item.skill}
                  state={state}
                  ringProgress={ringProgress}
                  href={
                    item.skill.status === "locked"
                      ? undefined
                      : lessonHrefForSkill(item.skill.id)
                  }
                />
              </div>
            );
          })}
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
  skill,
  unitNumber,
}: {
  unit: UnitResponse;
  skill: SkillPathResponse;
  unitNumber: number;
}) {
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
              Unit {unitNumber}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold leading-tight text-white md:text-2xl">
              {skill.title}
            </h2>
            <p className="mt-1 text-[13px] font-bold text-white/70">
              {unit.title}
              {skill.crown_level > 0 ? ` · Crown level ${skill.crown_level}` : ""}
            </p>
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

function skillNodeState(
  skill: SkillPathResponse,
  index: number,
  activeIndex: number,
): "locked" | "active" | "complete" {
  if (skill.status === "locked") return "locked";
  if (skill.status === "completed") return "complete";
  if (index === activeIndex) return "active";
  return "locked";
}

function SkillPathNode({
  skill,
  state,
  ringProgress,
  href,
}: {
  skill: SkillPathResponse;
  state: "locked" | "active" | "complete";
  ringProgress: number;
  href?: string;
}) {
  const filled = (ringProgress / 100) * RING_CIRCUMFERENCE;

  const buttonInner = (
    <>
      {(state === "active" || state === "complete") && (
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
          {state === "active" && (
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
          )}
          {state === "complete" && (
            <circle
              cx="44"
              cy="44"
              r={RING_RADIUS}
              fill="none"
              stroke="#6b6b6b"
              strokeWidth="6"
            />
          )}
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
        <StarIcon muted={state === "locked"} />
      </span>
    </>
  );

  if (state === "active" || state === "complete") {
    return (
      <div className="relative flex h-[88px] w-[88px] items-center justify-center">
        {href ? (
          <Link
            href={href}
            className="relative flex h-full w-full items-center justify-center"
            aria-label={skill.title}
          >
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
      aria-label={`${skill.title} (locked)`}
    >
      <StarIcon muted />
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
