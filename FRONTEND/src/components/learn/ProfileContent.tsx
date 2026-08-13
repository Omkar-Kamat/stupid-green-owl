import type { ReactNode } from "react";
import Link from "next/link";
import { PROFILE } from "@/data/profile";

export function ProfileContent() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 md:px-6">
      <ProfileHeader />
      <StatisticsSection />
      <AchievementsSection />
    </div>
  );
}

function ProfileHeader() {
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
            {PROFILE.displayName}
          </h1>
          <p className="mt-1 text-[15px] font-bold text-[#afafaf]">
            @{PROFILE.username}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-[#52656d]">
            <CalendarIcon />
            Joined {PROFILE.joined}
          </p>
          <div className="mt-3 flex items-center gap-4 text-[15px] font-bold">
            <Link href="#" className="text-[#1cb0f6] hover:underline">
              {PROFILE.following} Following
            </Link>
            <Link href="#" className="text-[#1cb0f6] hover:underline">
              {PROFILE.followers} Followers
            </Link>
          </div>
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

function StatisticsSection() {
  const { stats } = PROFILE;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-[22px] font-extrabold text-white">Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<StreakStatIcon />}
          value={String(stats.streak)}
          label="Day streak"
        />
        <StatCard
          icon={<XpStatIcon />}
          value={String(stats.totalXp)}
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
          value={stats.league}
          label="Current league"
          badge={stats.leagueWeek}
        />
        <StatCard
          icon={<MedalStatIcon />}
          value={String(stats.top3Finishes)}
          label="Top 3 finishes"
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

      <div className="overflow-hidden rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input">
        {PROFILE.achievements.map((achievement, index) => (
          <div key={achievement.id}>
            {index > 0 && <div className="mx-5 h-px bg-[#37464f]" />}
            <AchievementRow achievement={achievement} />
          </div>
        ))}
      </div>
    </section>
  );
}

function AchievementRow({
  achievement,
}: {
  achievement: (typeof PROFILE.achievements)[number];
}) {
  const pct = Math.min(100, (achievement.progress / achievement.total) * 100);

  return (
    <div className="flex items-start gap-4 p-5">
      <AchievementIcon type={achievement.icon} color={achievement.color} />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[17px] font-extrabold text-white">
            {achievement.name}
            <span className="ml-1 text-[#afafaf]"> {achievement.level}</span>
          </p>
          <span className="shrink-0 text-[14px] font-bold text-[#afafaf]">
            {achievement.progress}/{achievement.total}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-[#37464f]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#ffc800]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-2 text-[14px] font-bold text-[#afafaf]">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}

function AchievementIcon({ type, color }: { type: string; color: string }) {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
      style={{ backgroundColor: color }}
    >
      {type === "flame" && <FlameIcon />}
      {type === "sage" && <SageIcon />}
      {type === "champion" && <ChampionIcon />}
    </div>
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
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <circle cx="16" cy="14" r="10" fill="#afafaf" />
      <path d="M10 24 L16 30 L22 24" fill="#777777" />
      <text x="16" y="18" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
        3
      </text>
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
      <path d="M12 2c1 4 4 6 4 10a4 4 0 11-8 0c0-2 1.5-3.5 3-5 0 3 2 5 1 7z" />
    </svg>
  );
}

function SageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <circle cx="12" cy="10" r="6" fill="#fff" />
      <path d="M6 20c0-4 2.7-6 6-6s6 2 6 6" fill="#fff" />
      <path d="M8 8 L12 4 L16 8" fill="#58cc02" />
    </svg>
  );
}

function ChampionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
      <path d="M6 2h12v4l-2 2 2 2v12H6V10l2-2-2-2V2z" />
    </svg>
  );
}
