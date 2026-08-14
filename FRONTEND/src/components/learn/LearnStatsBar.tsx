"use client";

import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatBadge,
} from "@/components/learn/LearnStatBadge";
import { useOptionalUserStats } from "@/components/providers/UserStatsProvider";

const LANGUAGES_LEARNING = 1;

export function LearnStatsBar({ className = "" }: { className?: string }) {
  const context = useOptionalUserStats();
  const { stats, loading, error, refresh } = context ?? {};

  if (error) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <p className="text-[13px] font-bold text-[#ff4b4b]">{error}</p>
        {refresh && (
          <button
            type="button"
            onClick={() => void refresh()}
            className="self-start text-[12px] font-extrabold uppercase tracking-wide text-[#1cb0f6] hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const streak = loading ? "…" : stats ? String(stats.current_streak) : "—";
  const xp = loading ? "…" : stats ? String(stats.total_xp) : "—";
  const gems = loading ? "…" : stats ? String(stats.gems) : "—";
  const hearts = loading ? "…" : stats ? String(stats.hearts) : "—";

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <LanguagesLearningBadge count={LANGUAGES_LEARNING} />
      <LearnStatBadge
        iconSrc={LEARN_STAT_ICONS.streak}
        value={streak}
        color="text-[#ff9600]"
      />
      <LearnStatBadge
        iconSrc={LEARN_STAT_ICONS.xp}
        value={xp}
        color="text-[#ffc800]"
      />
      <LearnStatBadge
        iconSrc={LEARN_STAT_ICONS.gem}
        value={gems}
        color="text-[#1cb0f6]"
      />
      <LearnStatBadge
        iconSrc={LEARN_STAT_ICONS.heart}
        value={hearts}
        color="text-[#ff4b4b]"
      />
    </div>
  );
}
