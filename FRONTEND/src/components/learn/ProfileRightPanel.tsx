"use client";

import { useState } from "react";
import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatBadge,
} from "@/components/learn/LearnStatBadge";
import { LearnRightPanelFooter } from "@/components/learn/LearnRightPanelFooter";

const LANGUAGES_LEARNING = 1;

type SocialTab = "following" | "followers";

export function ProfileRightPanel() {
  const [tab, setTab] = useState<SocialTab>("following");

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
        <div className="mb-5 flex border-b-2 border-[#37464f]">
          {(["following", "followers"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`flex-1 pb-3 text-[12px] font-extrabold uppercase tracking-wide transition-colors ${
                tab === item
                  ? "border-b-2 border-[#1cb0f6] text-[#1cb0f6]"
                  : "text-[#52656d] hover:text-[#afafaf]"
              }`}
              style={{ marginBottom: tab === item ? "-2px" : "0" }}
            >
              {item}
            </button>
          ))}
        </div>

        <SocialIllustration />

        <p className="mt-5 text-center text-[15px] font-bold leading-snug text-[#afafaf]">
          Learning is more fun and effective when you connect with others.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
        <h3 className="mb-4 text-[17px] font-extrabold text-white">Add friends</h3>

        <button
          type="button"
          className="flex w-full items-center gap-3 border-b-2 border-[#37464f] py-4 text-left transition-colors hover:bg-white/5"
        >
          <SearchIcon />
          <span className="flex-1 text-[15px] font-bold text-white">Find friends</span>
          <ChevronIcon />
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-white/5"
        >
          <EnvelopeIcon />
          <span className="flex-1 text-[15px] font-bold text-white">Invite friends</span>
          <ChevronIcon />
        </button>
      </div>

      <LearnRightPanelFooter />
    </div>
  );
}

function SocialIllustration() {
  const colors = ["#ce82ff", "#58cc02", "#ff9600", "#1cb0f6", "#ff86d0"];

  return (
    <div className="flex items-end justify-center gap-2 px-2 pt-2">
      {colors.map((color, i) => (
        <div
          key={color}
          className="rounded-t-full"
          style={{
            backgroundColor: color,
            width: 36 + (i % 2) * 4,
            height: 48 + (i % 3) * 8,
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#37464f] text-[#afafaf]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
      </svg>
    </div>
  );
}

function EnvelopeIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#58cc02] text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#52656d]" fill="currentColor" aria-hidden="true">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
