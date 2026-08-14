/* eslint-disable @next/next/no-img-element */

export const LEARN_STAT_ICONS = {
  streak: "/illustrations/streak.svg",
  xp: "/illustrations/daily-quest-lightning.svg",
  gem: "/illustrations/gem.svg",
  heart: "/illustrations/heart.svg",
} as const;

export function LearnStatIcon({
  src,
  className = "h-6 w-6",
}: {
  src: string;
  className?: string;
}) {
  return (
    <img src={src} alt="" width={24} height={24} className={className} aria-hidden />
  );
}

export function LearnStatBadge({
  iconSrc,
  value,
  color = "text-white",
  iconClassName = "h-7 w-7",
}: {
  iconSrc: string;
  value: string;
  color?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-[15px] font-bold ${color}`}>
      <LearnStatIcon src={iconSrc} className={iconClassName} />
      <span>{value}</span>
    </div>
  );
}

export function LanguagesLearningBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-bold text-white">
      <img
        src="/flags/edea4fa18ff3e7d8c0282de3f102aaed.svg"
        alt="Japanese"
        width={36}
        height={28}
        className="h-7 w-9 rounded-[4px] border border-[#52656d]/60"
      />
      <span>{count}</span>
    </div>
  );
}
