import type { ReactNode } from "react";

export function ShopContent() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 md:px-6">
      <ShopSection title="Hearts" className="mt-0">
        <ShopItem
          icon={<HeartRefillIcon />}
          title="Refill Hearts"
          description="Get full hearts so you can worry less about making mistakes in a lesson"
          action={
            <ShopActionButton variant="primary">
              Get for: <GemInline /> 350
            </ShopActionButton>
          }
        />
        <ShopDivider />
        <ShopItem
          icon={<UnlimitedHeartsIcon />}
          title="Unlimited Hearts"
          description="Never run out of hearts with Super!"
          action={
            <ShopActionButton variant="outline-purple">
              Free trial
            </ShopActionButton>
          }
        />
      </ShopSection>

      <ShopSection title="Power-Ups">
        <ShopItem
          icon={<StreakFreezeIcon />}
          title="Streak Freeze"
          titleExtra={
            <span className="text-[13px] font-extrabold uppercase tracking-wide text-[#58cc02]">
              2 / 2 equipped
            </span>
          }
          description="Streak Freeze allows your streak to remain in place for one full day of inactivity."
          action={
            <ShopActionButton variant="disabled" disabled>
              Equipped
            </ShopActionButton>
          }
        />
      </ShopSection>
    </div>
  );
}

function ShopSection({
  title,
  children,
  className = "mt-10",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-[22px] font-extrabold text-white">{title}</h2>
      <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input">
        {children}
      </div>
    </section>
  );
}

function ShopItem({
  icon,
  title,
  titleExtra,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  titleExtra?: ReactNode;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#131f24]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-extrabold text-white">{title}</h3>
            {titleExtra}
          </div>
          <p className="mt-1 text-[14px] leading-snug text-[#afafaf]">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:ml-2">{action}</div>
    </div>
  );
}

function ShopDivider() {
  return <div className="mx-5 h-px bg-[#37464f]" />;
}

function ShopActionButton({
  children,
  variant,
  disabled,
}: {
  children: ReactNode;
  variant: "primary" | "outline-purple" | "disabled";
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "border-[#1899d6] bg-[#1cb0f6] text-white hover:brightness-110",
    "outline-purple":
      "border-[#52656d] bg-transparent text-[#ce82ff] hover:bg-white/5",
    disabled:
      "cursor-not-allowed border-[#52656d] bg-[#37464f] text-[#afafaf]",
  };

  return (
    <button
      type="button"
      disabled={disabled ?? variant === "disabled"}
      className={`inline-flex min-w-[140px] items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 px-4 py-3 text-[12px] font-extrabold uppercase tracking-wide transition-all active:border-b-2 active:translate-y-[2px] ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function GemInline() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/illustrations/gem.svg"
      alt=""
      width={18}
      height={18}
      className="inline h-[18px] w-[18px]"
      aria-hidden
    />
  );
}

function HeartRefillIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/illustrations/heart.svg"
      alt=""
      width={36}
      height={36}
      className="h-9 w-9"
      aria-hidden
    />
  );
}

function UnlimitedHeartsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#58cc02" />
          <stop offset="50%" stopColor="#1cb0f6" />
          <stop offset="100%" stopColor="#ce82ff" />
        </linearGradient>
      </defs>
      <path
        d="M24 38c-8-6-14-12-14-19a8 8 0 0114-4 8 8 0 0114 4c0 7-6 13-14 19z"
        fill="url(#heartGrad)"
      />
      <text
        x="24"
        y="26"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
      >
        ∞
      </text>
    </svg>
  );
}

function StreakFreezeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <path
        d="M24 4 L30 18 L44 20 L33 30 L36 44 L24 37 L12 44 L15 30 L4 20 L18 18 Z"
        fill="#1cb0f6"
      />
      <path
        d="M24 10 L28 20 L38 21 L30 28 L32 38 L24 33 L16 38 L18 28 L10 21 L20 20 Z"
        fill="#78c8ff"
      />
    </svg>
  );
}
