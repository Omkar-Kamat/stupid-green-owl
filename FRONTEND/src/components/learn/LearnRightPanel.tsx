"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LearnStatsBar } from "@/components/learn/LearnStatsBar";
import { LearnRightPanelFooter } from "@/components/learn/LearnRightPanelFooter";
import { useOptionalUserStats } from "@/components/providers/UserStatsProvider";

export function LearnRightPanel() {
  const { stats, loading } = useOptionalUserStats() ?? {};

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-6 pb-10 pt-2">
      <div className="px-1 py-2">
        <LearnStatsBar />
      </div>

      <BronzeLeagueCard totalXp={stats?.total_xp} loading={loading} />
      <DailyQuestsCard dailyGoal={stats?.daily_goal} loading={loading} />
      <LearnRightPanelFooter />
    </div>
  );
}

function BronzeLeagueCard({
  totalXp,
  loading,
}: {
  totalXp?: number;
  loading?: boolean;
}) {
  return (
    <PanelCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-extrabold text-white">Leaderboard</h3>
        <Link
          href="/learn/japanese/leaderboards"
          className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#1cb0f6] hover:underline"
        >
          View league
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/bronze-league.svg"
            alt=""
            width={44}
            height={49}
            className="h-12 w-11"
            aria-hidden
          />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-snug text-white">
            {loading ? "Loading rank…" : `Total XP: ${totalXp ?? 0}`}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[#afafaf]">
            Check leaderboards for your current rank
          </p>
        </div>
      </div>
    </PanelCard>
  );
}

function DailyQuestsCard({
  dailyGoal = 30,
  loading,
}: {
  dailyGoal?: number;
  loading?: boolean;
}) {
  return (
    <PanelCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-extrabold text-white">Daily Goal</h3>
        <Link
          href="/learn/japanese/quests"
          className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#1cb0f6] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/daily-quest-lightning.svg"
          alt=""
          width={32}
          height={32}
          className="h-9 w-9 shrink-0"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-white">
            {loading ? "Loading…" : `Daily goal: ${dailyGoal} XP`}
          </p>
          <p className="mt-1 text-[13px] text-[#afafaf]">
            Daily XP progress is tracked server-side
          </p>
        </div>
      </div>
    </PanelCard>
  );
}

function PanelCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
      {children}
    </div>
  );
}
