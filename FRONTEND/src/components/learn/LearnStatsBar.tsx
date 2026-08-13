"use client";

import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatBadge,
} from "@/components/learn/LearnStatBadge";
import { useOptionalUserStats } from "@/components/providers/UserStatsProvider";

const LANGUAGES_LEARNING = 1;

export function LearnStatsBar({ className = "" }: { className?: string }) {
  const { stats, loading } = useOptionalUserStats() ?? {};

  const streak = loading ? "…" : String(stats?.current_streak ?? 0);
  const gems = loading ? "…" : String(stats?.gems ?? 0);
  const hearts = loading ? "…" : String(stats?.hearts ?? 0);

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <LanguagesLearningBadge count={LANGUAGES_LEARNING} />
      <LearnStatBadge
        iconSrc={LEARN_STAT_ICONS.streak}
        value={streak}
        color="text-[#ff9600]"
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
