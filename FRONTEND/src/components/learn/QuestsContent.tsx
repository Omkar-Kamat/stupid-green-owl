export function QuestsContent() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-16 pt-6 md:px-6">
      <WelcomeBanner />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-extrabold text-white">Daily Quests</h2>
          <div className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-[#ffc800]">
            <ClockIcon />
            23 hours
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <DailyQuestCard />
          <LockedQuestCard />
        </div>
      </div>
    </div>
  );
}

function WelcomeBanner() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#ce82ff] shadow-[0_4px_0_#a855d6]">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-extrabold text-white md:text-[28px]">
            Welcome!
          </h1>
          <p className="mt-2 text-[15px] font-bold leading-snug text-white/90 md:text-[16px]">
            Complete quests to earn rewards! Quests refresh every day.
          </p>
        </div>

        <div className="relative hidden h-[100px] w-[120px] shrink-0 sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/path-owl.svg"
            alt=""
            width={90}
            height={90}
            className="absolute bottom-0 left-0 h-[90px] w-[90px]"
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/quest-reward-chest.svg"
            alt=""
            width={48}
            height={48}
            className="absolute bottom-2 right-0 h-12 w-12"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function DailyQuestCard() {
  return (
    <div className="rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/daily-quest-lightning.svg"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="mb-3 text-[17px] font-bold text-white">Earn 10 XP</p>

          <div className="flex items-center">
            <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-[#4a4020]">
              <div className="absolute inset-0 rounded-full bg-[#ffc800]" />
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#a56600]">
                10 / 10
              </span>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/quest-reward-chest.svg"
              alt=""
              width={40}
              height={40}
              className="-ml-0.5 h-10 w-10 shrink-0"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedQuestCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#52656d]">
        <LockIcon />
      </div>
      <p className="text-[17px] font-bold text-[#52656d]">More quests unlock soon</p>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h4v-2h-3V7h-2v6z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z" />
    </svg>
  );
}
