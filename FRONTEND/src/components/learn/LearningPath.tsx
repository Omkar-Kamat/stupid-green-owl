const PATH_NODES: Array<{
  id: string;
  type: "start" | "star" | "chest" | "trophy";
  offset: number;
  active?: boolean;
}> = [
  { id: "1", type: "start", offset: 0, active: true },
  { id: "2", type: "star", offset: 56 },
  { id: "3", type: "chest", offset: -56 },
  { id: "4", type: "star", offset: 56 },
  { id: "5", type: "trophy", offset: 0 },
];

export function LearningPath() {
  return (
    <div className="flex min-h-full flex-col">
      <UnitBanner />

      <div className="relative mx-auto flex w-full max-w-[720px] justify-center px-4 pb-20 pt-16 sm:px-6">
        <div className="relative flex w-[260px] shrink-0 flex-col items-center gap-10">
          {PATH_NODES.map((node, index) => (
            <div
              key={node.id}
              className="relative flex w-full justify-center"
              style={{ transform: `translateX(${node.offset}px)` }}
            >
              {index === 0 && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[13px] font-extrabold uppercase tracking-wider text-[#6b6b6b]">
                  Start
                </span>
              )}
              <PathNode type={node.type} active={node.active} />
            </div>
          ))}

          <div className="mt-4 w-full pt-6">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#37464f]" />
              <span className="shrink-0 text-center text-[13px] font-extrabold uppercase tracking-wide text-[#52656d]">
                Describe people
              </span>
              <div className="h-px flex-1 bg-[#37464f]" />
            </div>

            <div className="flex flex-col items-center">
              <div className="relative z-20 mb-3">
                <div className="rounded-2xl bg-[#ce82ff] px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_4px_0_#a855d6]">
                  Jump here?
                </div>
                <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[10px] border-x-transparent border-t-[#ce82ff]" />
              </div>
              <button
                type="button"
                className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-[6px] border-[#a855d6] bg-[#ce82ff] text-white shadow-[0_4px_0_#a855d6] transition-transform hover:scale-105 active:translate-y-[2px] active:border-b-[4px] active:shadow-none"
                aria-label="Jump here"
              >
                <FastForwardIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Owl column — beside the path, not overlapping nodes */}
        <div className="relative hidden w-[360px] shrink-0 sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/path-owl.svg"
            alt=""
            width={360}
            height={360}
            className="pointer-events-none absolute -left-4 top-[168px] h-[360px] w-[360px]"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function UnitBanner() {
  return (
    <div className="px-4 pt-8 pb-4 md:px-6">
      <div className="w-full rounded-2xl bg-duo-green shadow-[0_4px_0_#3d3d3d]">
        <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-6">
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-white/75">
              ← Section 1, Unit 1
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold leading-tight text-white md:text-2xl">
              Order food and drinks
            </h2>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-2xl border-2 border-b-4 border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white transition-all hover:bg-white/20 active:border-b-2 active:translate-y-[2px]"
          >
            📖 Guidebook
          </button>
        </div>
      </div>
    </div>
  );
}

function PathNode({
  type,
  active,
}: {
  type: "start" | "star" | "chest" | "trophy";
  active?: boolean;
}) {
  if (active) {
    return (
      <div className="relative flex h-[88px] w-[88px] items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 88 88"
          aria-hidden="true"
        >
          <circle
            cx="44"
            cy="44"
            r="40"
            fill="none"
            stroke="#37464f"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r="40"
            fill="none"
            stroke="#6b6b6b"
            strokeWidth="6"
            strokeDasharray="190 251"
            strokeLinecap="round"
          />
        </svg>
        <button
          type="button"
          className="relative flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-[6px] border-duo-green-dark bg-duo-green shadow-[0_4px_0_#3d3d3d] transition-transform hover:scale-105 active:translate-y-[2px] active:border-b-[4px] active:shadow-none"
          aria-label={type}
        >
          <StarIcon />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-[6px] border-[#2b3a40] bg-[#37464f] shadow-[0_4px_0_#2b3a40] transition-transform hover:scale-105 active:translate-y-[2px] active:border-b-[4px] active:shadow-none"
      aria-label={type}
    >
      {type === "star" && <StarIcon muted />}
      {type === "chest" && <ChestIcon />}
      {type === "trophy" && <TrophyIcon />}
    </button>
  );
}

function StarIcon({ muted = false }: { muted?: boolean }) {
  const fill = muted ? "#52656d" : "white";
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill={fill}
        d="M12 2l2.9 6.5L22 9.5l-5 4.8 1.2 6.9L12 17.8 5.8 21.2 7 14.3 2 9.5l7.1-1L12 2z"
      />
    </svg>
  );
}

function ChestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill="#52656d"
        d="M4 8h16v11H4V8zm2-5h12v5H6V3zm4 9v3h4v-3h-4z"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill="#52656d"
        d="M6 4h12v3c0 3.3-2.3 6.1-5.5 6.8V17h3v2H8v-2h3v-3.2C7.3 13.1 5 10.3 5 7V4zm2 2v1c0 2.2 1.8 4 4 4s4-1.8 4-4V6H8z"
      />
    </svg>
  );
}

function FastForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d="M5 5v14l8-7-8-7zm9 0v14l8-7-8-7z" />
    </svg>
  );
}
