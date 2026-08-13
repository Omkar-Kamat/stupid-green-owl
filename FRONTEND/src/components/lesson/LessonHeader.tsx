import Link from "next/link";

export function LessonHeader({
  progress,
  hearts,
  streakLabel,
}: {
  progress: number;
  hearts: number;
  streakLabel?: string;
}) {
  return (
    <header className="relative flex items-center gap-4 px-4 py-4 md:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/learn/japanese"
          className="flex h-10 w-10 items-center justify-center text-[#52656d] transition-colors hover:text-[#afafaf]"
          aria-label="Close lesson"
        >
          <CloseIcon />
        </Link>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-[#52656d] transition-colors hover:text-[#afafaf]"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </div>

      <div className="relative min-w-0 flex-1 px-2">
        {streakLabel && (
          <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
            <span className="rounded-lg bg-[#58cc02] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-[0_2px_0_#46a302]">
              {streakLabel}
            </span>
          </div>
        )}
        <div className="h-4 overflow-hidden rounded-full bg-[#37464f]">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/heart.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          aria-hidden
        />
        <span className="text-[15px] font-bold text-[#ff4b4b]">{hearts}</span>
      </div>
    </header>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4.5a7.8 7.8 0 00-.1-1l2-1.5a.7.7 0 00.2-.9l-1.9-3.3a.7.7 0 00-.8-.3l-2.4 1a7.2 7.2 0 00-1.7-1l-.4-2.5a.7.7 0 00-.7-.6h-3.8a.7.7 0 00-.7.6l-.4 2.5a7.2 7.2 0 00-1.7 1l-2.4-1a.7.7 0 00-.8.3l-1.9 3.3a.7.7 0 00.2.9l2 1.5a7.8 7.8 0 000 2l-2 1.5a.7.7 0 00-.2.9l1.9 3.3a.7.7 0 00.8.3l2.4-1c.5.4 1.1.7 1.7 1l.4 2.5a.7.7 0 00.7.6h3.8a.7.7 0 00.7-.6l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1a.7.7 0 00.8-.3l1.9-3.3a.7.7 0 00-.2-.9l-2-1.5c.1-.3.1-.7.1-1z" />
    </svg>
  );
}
