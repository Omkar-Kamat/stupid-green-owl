import Link from "next/link";
import type { ReactNode } from "react";
import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatBadge,
} from "@/components/learn/LearnStatBadge";
import { LearnRightPanelFooter } from "@/components/learn/LearnRightPanelFooter";

const LANGUAGES_LEARNING = 1;

export function LearnRightPanel() {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-6 pb-10 pt-2">
      <div className="flex items-center justify-between px-1 py-2">
        <LanguagesLearningBadge count={LANGUAGES_LEARNING} />
        <LearnStatBadge
          iconSrc={LEARN_STAT_ICONS.streak}
          value="1"
          color="text-[#ff9600]"
        />
        <LearnStatBadge
          iconSrc={LEARN_STAT_ICONS.gem}
          value="505"
          color="text-[#1cb0f6]"
        />
        <LearnStatBadge
          iconSrc={LEARN_STAT_ICONS.heart}
          value="4"
          color="text-[#ff4b4b]"
        />
      </div>

      <BronzeLeagueCard />
      <DailyQuestsCard />
      <LearnRightPanelFooter />
    </div>
  );
}

function BronzeLeagueCard() {
  return (
    <PanelCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-extrabold text-white">Bronze League</h3>
        <Link
          href="#"
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
            You&apos;re ranked #12
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[#afafaf]">
            You&apos;ve earned 43 XP this week so far
          </p>
        </div>
      </div>
    </PanelCard>
  );
}

function DailyQuestsCard() {
  return (
    <PanelCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-extrabold text-white">Daily Quests</h3>
        <Link
          href="#"
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
          <p className="mb-3 text-[15px] font-bold text-white">Earn 10 XP</p>

          <div className="flex items-center">
            <div className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#4a4020]">
              <div className="absolute inset-0 rounded-full bg-[#ffc800]" />
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#a56600]">
                10 / 10
              </span>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/quest-reward-chest.svg"
              alt=""
              width={36}
              height={36}
              className="-ml-0.5 h-9 w-9 shrink-0"
              aria-hidden
            />
          </div>
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
