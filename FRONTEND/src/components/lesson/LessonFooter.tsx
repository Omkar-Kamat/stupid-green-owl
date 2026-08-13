import type { ReactNode } from "react";

export function LessonActionFooter({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right: ReactNode;
}) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#37464f] bg-[#131f24]">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-[140px]">{left}</div>
        <div className="hidden sm:block">{center}</div>
        <div className="ml-auto">{right}</div>
      </div>
    </footer>
  );
}

export function SkipButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border-2 border-b-4 border-[#52656d] bg-transparent px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-[#52656d] transition-all hover:bg-white/5 active:border-b-2 active:translate-y-[2px]"
    >
      Skip
    </button>
  );
}

export function CheckButton({
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-[150px] rounded-2xl px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-wide transition-all ${
        disabled
          ? "cursor-not-allowed border-2 border-b-4 border-[#37464f] bg-[#37464f] text-[#52656d]"
          : "border-2 border-b-4 border-[#46a302] bg-[#58cc02] text-[#131f24] hover:brightness-110 active:border-b-2 active:translate-y-[2px]"
      }`}
    >
      Check
    </button>
  );
}

export function CantListenButton() {
  return (
    <button
      type="button"
      className="text-[11px] font-extrabold uppercase tracking-wide text-[#52656d] hover:text-[#afafaf]"
    >
      Can&apos;t listen now
    </button>
  );
}

export function UseKeyboardButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-[#52656d] hover:text-[#afafaf]"
    >
      <KeyboardIcon />
      Use keyboard
    </button>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm2 2v2h2V8H6zm3 0v2h2V8H9zm3 0v2h2V8h-2zm3 0v2h2V8h-2zM6 13v2h2v-2H6zm3 0v2h2v-2H9zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2z" />
    </svg>
  );
}
