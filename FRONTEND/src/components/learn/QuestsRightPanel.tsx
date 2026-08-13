import Link from "next/link";
import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatBadge,
} from "@/components/learn/LearnStatBadge";
import { LearnRightPanelFooter } from "@/components/learn/LearnRightPanelFooter";

const LANGUAGES_LEARNING = 1;

export function QuestsRightPanel() {
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
          value="0"
          color="text-[#ff4b4b]"
        />
      </div>

      <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffc800]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/daily-quest-lightning.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
              aria-hidden
            />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#58cc02]">
            <span className="text-2xl" aria-hidden="true">
              🏅
            </span>
          </div>
        </div>

        <p className="text-center text-[15px] font-bold leading-snug text-white">
          Monthly challenges unlock soon!
        </p>
        <p className="mt-2 text-center text-[13px] leading-snug text-[#afafaf]">
          Complete each month&apos;s challenge to earn exclusive badges
        </p>

        <Link
          href="/learn/japanese"
          className="mt-5 flex w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#1899d6] bg-transparent px-4 py-3 text-[13px] font-extrabold uppercase tracking-wide text-[#1cb0f6] transition-all hover:bg-[#1cb0f6]/10 active:border-b-2 active:translate-y-[2px]"
        >
          Start a lesson
        </Link>
      </div>

      <LearnRightPanelFooter />
    </div>
  );
}
