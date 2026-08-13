"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { meApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { UserResponse, UserStatsResponse } from "@/lib/api/types";

export function ProfileContent() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [user, userStats] = await Promise.all([
          meApi.getProfile(),
          meApi.getStats(),
        ]);
        setProfile(user);
        setStats(userStats);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 md:px-6">
        <p className="text-[15px] font-bold text-[#afafaf]">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 md:px-6">
        <p className="text-[15px] font-bold text-[#ff4b4b]">
          {error ?? "Could not load profile."}
        </p>
      </div>
    );
  }

  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 md:px-6">
      <ProfileHeader username={profile.username} joined={joined} />
      <StatisticsSection stats={stats} />
      <AchievementsSection />
    </div>
  );
}

function ProfileHeader({ username, joined }: { username: string; joined: string }) {
  return (
    <section className="relative">
      <button
        type="button"
        className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-[#52656d] hover:text-[#afafaf]"
        aria-label="Settings"
      >
        <SettingsIcon />
      </button>

      <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input">
        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#37464f] text-[#afafaf] hover:bg-[#3f5560]"
          aria-label="Edit profile picture"
        >
          <PencilIcon />
        </button>

        <div className="flex justify-center px-6 pb-8 pt-10">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-dashed border-[#1cb0f6] bg-[#131f24]">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1cb0f6]/20">
              <PlusIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-white md:text-[32px]">
            {username}
          </h1>
          <p className="mt-1 text-[15px] font-bold text-[#afafaf]">@{username}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-[#52656d]">
            <CalendarIcon />
            Joined {joined}
          </p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flags/edea4fa18ff3e7d8c0282de3f102aaed.svg"
          alt="Japanese"
          width={40}
          height={30}
          className="mt-1 h-8 w-10 shrink-0 rounded-[4px] border border-[#52656d]/60"
        />
      </div>
    </section>
  );
}

function StatisticsSection({ stats }: { stats: UserStatsResponse }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-[22px] font-extrabold text-white">Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<StreakStatIcon />}
          value={String(stats.current_streak)}
          label="Day streak"
        />
        <StatCard
          icon={<XpStatIcon />}
          value={String(stats.total_xp)}
          label="Total XP"
        />
        <StatCard
          icon={
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/illustrations/bronze-league.svg"
              alt=""
              width={36}
              height={40}
              className="h-10 w-9"
              aria-hidden
            />
          }
          value={`${stats.hearts}/${stats.max_hearts}`}
          label="Hearts"
        />
        <StatCard
          icon={<MedalStatIcon />}
          value={String(stats.gems)}
          label="Gems"
        />
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  badge,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  badge?: string;
}) {
  return (
    <div className="relative rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-4">
      {badge && (
        <span className="absolute right-3 top-3 rounded-md bg-[#ff9600] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
      <div className="mb-2">{icon}</div>
      <p className="text-[22px] font-extrabold leading-none text-white">{value}</p>
      <p className="mt-1 text-[13px] font-bold text-[#afafaf]">{label}</p>
    </div>
  );
}

function AchievementsSection() {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold text-white">Achievements</h2>
        <Link
          href="#"
          className="text-[11px] font-extrabold uppercase tracking-wide text-[#1cb0f6] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
        <p className="text-[14px] font-bold text-[#afafaf]">
          Achievements are not available from the backend yet.
        </p>
      </div>
    </section>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4.5a7.8 7.8 0 00-.1-1l2-1.5a.7.7 0 00.2-.9l-1.9-3.3a.7.7 0 00-.8-.3l-2.4 1a7.2 7.2 0 00-1.7-1l-.4-2.5a.7.7 0 00-.7-.6h-3.8a.7.7 0 00-.7.6l-.4 2.5a7.2 7.2 0 00-1.7 1l-2.4-1a.7.7 0 00-.8.3l-1.9 3.3a.7.7 0 00.2.9l2 1.5a7.8 7.8 0 000 2l-2 1.5a.7.7 0 00-.2.9l1.9 3.3a.7.7 0 00.8.3l2.4-1c.5.4 1.1.7 1.7 1l.4 2.5a.7.7 0 00.7.6h3.8a.7.7 0 00.7-.6l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1a.7.7 0 00.8-.3l1.9-3.3a.7.7 0 00-.2-.9l-2-1.5c.1-.3.1-.7.1-1z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1cb0f6]" fill="currentColor" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 8H5v10h14V10z" />
    </svg>
  );
}

function StreakStatIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/illustrations/streak.svg" alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
  );
}

function XpStatIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/illustrations/daily-quest-lightning.svg"
      alt=""
      width={32}
      height={32}
      className="h-8 w-8"
      aria-hidden
    />
  );
}

function MedalStatIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/illustrations/gem.svg" alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
  );
}
