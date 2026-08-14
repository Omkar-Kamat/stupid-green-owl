"use client";

import { LearnStatsBar } from "@/components/learn/LearnStatsBar";
import { LearnRightPanelFooter } from "@/components/learn/LearnRightPanelFooter";

const STATUS_EMOJIS = [
  "🦉",
  "🎉",
  "💪",
  "👀",
  "🍿",
  "🇯🇵",
  "😎",
  "💯",
  "💩",
  "🏆",
  "🔥",
  "✨",
];

export function LeaderboardRightPanel() {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-6 pb-10 pt-2">
      <div className="px-1 py-2">
        <LearnStatsBar />
      </div>

      <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
        <h3 className="text-center text-[15px] font-extrabold text-white">
          Set your status
        </h3>

        <div className="relative mx-auto mt-6 flex h-[120px] w-[120px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#52656d]" />
          <span className="text-[32px] font-extrabold text-[#52656d]">0</span>
          <div className="absolute -right-1 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#37464f] bg-[#202f36] text-sm">
            🙂
          </div>
        </div>

        <div className="mt-6 grid grid-cols-6 gap-2">
          {STATUS_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-b-4 border-[#37464f] bg-[#202f36] text-lg transition-all hover:bg-[#263740] active:border-b-2 active:translate-y-[2px]"
              aria-label={`Set status ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <LearnRightPanelFooter />
    </div>
  );
}
