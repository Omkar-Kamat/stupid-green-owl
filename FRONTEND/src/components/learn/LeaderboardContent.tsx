"use client";

import { useCallback, useEffect, useState } from "react";
import { leaderboardApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { LeaderboardEntry as ApiLeaderboardEntry } from "@/lib/api/types";
import { DEMO_CREDENTIALS } from "@/lib/demoAuth";

const PROMOTION_COUNT = 10;

export function LeaderboardContent() {
  const [entries, setEntries] = useState<ApiLeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardApi.getLeaderboard();
      setEntries(data.entries);
      setCurrentUserRank(data.current_user_rank);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 pb-16 pt-8 md:px-6">
        <p className="text-[15px] font-bold text-[#afafaf]">Loading leaderboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 px-4 pb-16 pt-8 md:px-6">
        <p className="text-[15px] font-bold text-[#ff4b4b]">{error}</p>
        <button
          type="button"
          onClick={() => void loadLeaderboard()}
          className="rounded-2xl border-2 border-b-4 border-[#1899d6] bg-[#1cb0f6] px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 pb-16 pt-8 md:px-6">
      <LeagueHeader currentUserRank={currentUserRank} />

      <div className="mt-10 w-full">
        {entries.map((entry, index) => {
          const showPromotionZone =
            entry.rank === PROMOTION_COUNT + 1 &&
            entries[index - 1]?.rank === PROMOTION_COUNT;

          return (
            <div key={entry.user_id}>
              {showPromotionZone && <PromotionZoneDivider />}
              <LeaderboardRow
                entry={entry}
                isCurrentUser={entry.user_id === DEMO_CREDENTIALS.userId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeagueHeader({ currentUserRank }: { currentUserRank: number | null }) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="mb-6 flex items-end justify-center gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <LockedLeagueShield key={`left-${i}`} />
        ))}
        <div className="flex h-[110px] w-[96px] shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/bronze-league.svg"
            alt=""
            width={96}
            height={110}
            className="h-[110px] w-[96px]"
            aria-hidden
          />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <LockedLeagueShield key={`right-${i}`} />
        ))}
      </div>

      <h1 className="text-[32px] font-extrabold leading-tight text-white md:text-[36px]">
        Global Leaderboard
      </h1>
      <p className="mt-2 text-[17px] text-[#afafaf] md:text-[19px]">
        Ranked by total XP
      </p>
      {currentUserRank !== null && (
        <p className="mt-2 text-[19px] font-bold text-[#ffc800] md:text-[21px]">
          Your rank: #{currentUserRank}
        </p>
      )}
    </div>
  );
}

function LockedLeagueShield() {
  return (
    <div className="flex h-[72px] w-[60px] items-center justify-center rounded-xl bg-[#37464f] opacity-60">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#52656d]" fill="currentColor" aria-hidden="true">
        <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V7c0-1.66 1.34-3 3-3z" />
      </svg>
    </div>
  );
}

function PromotionZoneDivider() {
  return (
    <div className="relative my-5 flex items-center">
      <div className="h-px flex-1 bg-[#58cc02]/40" />
      <span className="px-4 text-[12px] font-extrabold uppercase tracking-wider text-[#58cc02]">
        ↑ Promotion zone ↑
      </span>
      <div className="h-px flex-1 bg-[#58cc02]/40" />
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: ApiLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const inPromotionZone = entry.rank <= PROMOTION_COUNT;

  return (
    <div
      className={`mb-3 flex items-center gap-4 rounded-2xl border-2 px-5 py-4 ${
        isCurrentUser
          ? "border-[#52656d] bg-[#37464f]/70"
          : "border-[#37464f] bg-[#202f36]/40"
      }`}
    >
      <RankBadge rank={entry.rank} inPromotionZone={inPromotionZone} />
      <UserAvatar entry={entry} isCurrentUser={isCurrentUser} />
      <span className="min-w-0 flex-1 truncate text-[17px] font-bold text-white md:text-[18px]">
        {entry.username}
      </span>
      <span className="shrink-0 text-[15px] font-bold text-[#afafaf] md:text-[16px]">
        {entry.total_xp} XP
      </span>
    </div>
  );
}

function RankBadge({
  rank,
  inPromotionZone,
}: {
  rank: number;
  inPromotionZone: boolean;
}) {
  if (rank === 1) return <MedalBadge variant="gold" label="1" />;
  if (rank === 2) return <MedalBadge variant="silver" label="2" />;
  if (rank === 3) return <MedalBadge variant="bronze" label="3" />;

  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center text-[17px] font-extrabold ${
        inPromotionZone ? "text-[#58cc02]" : "text-white"
      }`}
    >
      {rank}
    </span>
  );
}

function MedalBadge({
  variant,
  label,
}: {
  variant: "gold" | "silver" | "bronze";
  label: string;
}) {
  const colors = {
    gold: { fill: "#ffc800", stroke: "#cd7900" },
    silver: { fill: "#afafaf", stroke: "#777777" },
    bronze: { fill: "#cd7900", stroke: "#945151" },
  };
  const { fill, stroke } = colors[variant];

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 40" className="h-11 w-11" aria-hidden="true">
        <path
          d="M18 2L4 8v12c0 10 6 18 14 20 8-2 14-10 14-20V8L18 2z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      </svg>
      <span className="absolute text-[14px] font-extrabold text-white">{label}</span>
    </div>
  );
}

function UserAvatar({
  entry,
  isCurrentUser,
}: {
  entry: ApiLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  if (isCurrentUser) {
    return (
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#52656d] bg-[#202f36]">
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-duo-dark-bg bg-[#58cc02]" />
      </div>
    );
  }

  const label = entry.username.slice(0, 1).toUpperCase();
  const colors = ["#1cb0f6", "#ce82ff", "#ff9600", "#58cc02", "#ff4b4b"];
  const color = colors[entry.user_id % colors.length];

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[17px] font-extrabold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}
