export function JapaneseWordTile({
  romaji,
  japanese,
  empty = false,
  selected = false,
}: {
  romaji?: string;
  japanese?: string;
  empty?: boolean;
  selected?: boolean;
}) {
  if (empty) {
    return (
      <div className="h-[52px] min-w-[72px] rounded-xl border-2 border-b-4 border-[#2b3a40] bg-[#1a2830]" />
    );
  }

  return (
    <button
      type="button"
      className={`flex min-w-[72px] flex-col items-center justify-center rounded-xl border-2 border-b-4 px-4 py-2 transition-all active:border-b-2 active:translate-y-[2px] ${
        selected
          ? "border-[#52656d] bg-[#37464f] text-white"
          : "border-[#52656d] bg-[#37464f] text-white hover:bg-[#3f5560]"
      }`}
    >
      <span className="text-[11px] font-bold text-[#afafaf]">{romaji}</span>
      <span className="text-[17px] font-bold leading-tight">{japanese}</span>
    </button>
  );
}

export function EnglishWordTile({
  word,
  empty = false,
}: {
  word?: string;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <div className="h-[46px] min-w-[80px] rounded-xl border-2 border-b-4 border-[#2b3a40] bg-[#1a2830]" />
    );
  }

  return (
    <button
      type="button"
      className="rounded-xl border-2 border-b-4 border-[#52656d] bg-[#37464f] px-5 py-3 text-[15px] font-bold text-white transition-all hover:bg-[#3f5560] active:border-b-2 active:translate-y-[2px]"
    >
      {word}
    </button>
  );
}

import type { ReactNode } from "react";

export function AnswerLine({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-h-[80px] w-full max-w-[680px] border-b-2 border-[#52656d] pb-4">
      {children && (
        <div className="flex min-h-[52px] flex-wrap items-end justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function WordBank({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      {children}
    </div>
  );
}

export function AudioButtons() {
  return (
    <div className="mb-12 flex items-center justify-center gap-4">
      <button
        type="button"
        className="flex h-[120px] w-[120px] items-center justify-center rounded-2xl border-2 border-b-[6px] border-[#1899d6] bg-[#1cb0f6] text-white shadow-none transition-all hover:brightness-110 active:border-b-[4px] active:translate-y-[2px]"
        aria-label="Play audio"
      >
        <SpeakerIcon />
      </button>
      <button
        type="button"
        className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-b-[5px] border-[#1899d6] bg-[#1cb0f6] text-white transition-all hover:brightness-110 active:border-b-[3px] active:translate-y-[2px]"
        aria-label="Play slow audio"
      >
        <TurtleIcon />
      </button>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function TurtleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden="true">
      <path d="M12 2C7 2 3 5.5 3 10c0 2.5 1.2 4.7 3 6.2V20h12v-3.8c1.8-1.5 3-3.7 3-6.2 0-4.5-4-8-9-8zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2z" />
    </svg>
  );
}
