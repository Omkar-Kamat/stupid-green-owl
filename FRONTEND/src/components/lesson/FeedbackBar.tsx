import type { ReactNode } from "react";

export function CorrectFeedbackBar({
  message,
  onContinue,
}: {
  message: string;
  onContinue?: () => void;
}) {
  return (
    <FeedbackBar variant="correct">
      <div className="flex flex-1 items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#58cc02]">
          <CheckIcon />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-[#58cc02]">{message}</p>
          <FeedbackLinks variant="correct" />
        </div>
      </div>
      <ContinueButton variant="correct" onContinue={onContinue} />
    </FeedbackBar>
  );
}

export function IncorrectFeedbackBar({
  romaji,
  japanese,
  meaning,
  onContinue,
}: {
  romaji: string;
  japanese: string;
  meaning: string;
  onContinue?: () => void;
}) {
  return (
    <FeedbackBar variant="incorrect">
      <div className="flex flex-1 items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ff4b4b]">
          <XIcon />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-extrabold text-[#ff4b4b]">Correct solution:</p>
          <p className="mt-1 text-[15px] font-bold text-[#ff7878]">{romaji}</p>
          <p className="text-[17px] font-bold text-[#ff7878]">{japanese}</p>
          <p className="mt-3 text-xl font-extrabold text-[#ff4b4b]">Meaning:</p>
          <p className="text-[15px] font-bold text-[#ff7878]">{meaning}</p>
          <FeedbackLinks variant="incorrect" />
        </div>
      </div>
      <ContinueButton variant="incorrect" onContinue={onContinue} />
    </FeedbackBar>
  );
}

function FeedbackBar({
  variant,
  children,
}: {
  variant: "correct" | "incorrect";
  children: ReactNode;
}) {
  const bg = variant === "correct" ? "bg-[#202f36]" : "bg-[#2a1f1f]";
  const border = variant === "correct" ? "border-[#37464f]" : "border-[#4a2c2c]";

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-20 border-t-2 ${border} ${bg}`}
    >
      <div className="mx-auto flex max-w-[1140px] flex-col items-stretch gap-4 px-6 py-5 sm:flex-row sm:items-center">
        {children}
      </div>
    </footer>
  );
}

function FeedbackLinks({ variant }: { variant: "correct" | "incorrect" }) {
  const color = variant === "correct" ? "text-[#58cc02]" : "text-[#ff7878]";

  return (
    <div className={`mt-3 flex flex-wrap items-center gap-4 text-[11px] font-extrabold uppercase tracking-wide ${color}`}>
      <button type="button" className="hover:opacity-80">
        Too easy
      </button>
      <button type="button" className="hover:opacity-80">
        Too difficult
      </button>
      <button type="button" className="flex items-center gap-1 hover:opacity-80">
        <FlagIcon />
        Report
      </button>
    </div>
  );
}

function ContinueButton({
  variant,
  onContinue,
}: {
  variant: "correct" | "incorrect";
  onContinue?: () => void;
}) {
  const classes =
    variant === "correct"
      ? "border-[#46a302] bg-[#58cc02] text-[#131f24]"
      : "border-[#ea2b2b] bg-[#ff4b4b] text-white";

  return (
    <button
      type="button"
      onClick={onContinue}
      className={`min-w-[180px] shrink-0 rounded-2xl border-2 border-b-4 px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-wide transition-all hover:brightness-110 active:border-b-2 active:translate-y-[2px] ${classes}`}
    >
      Continue
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
      <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M5 3v18h2V3H5zm2 0h12l-2 4 2 4H7V3z" />
    </svg>
  );
}
