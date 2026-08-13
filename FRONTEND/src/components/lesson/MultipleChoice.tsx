export function MultipleChoiceOption({
  number,
  romaji,
  japanese,
  selected = false,
  correct = false,
}: {
  number: number;
  romaji: string;
  japanese: string;
  selected?: boolean;
  correct?: boolean;
}) {
  const borderColor = correct
    ? "border-[#58cc02]"
    : selected
      ? "border-[#1cb0f6]"
      : "border-[#52656d]";
  const textColor = correct ? "text-[#58cc02]" : "text-white";

  return (
    <button
      type="button"
      className={`flex w-full max-w-[560px] items-center gap-4 rounded-2xl border-2 border-b-4 bg-[#202f36] px-5 py-4 text-left transition-all hover:bg-[#263740] active:border-b-2 active:translate-y-[2px] ${borderColor}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#52656d] text-[13px] font-extrabold text-[#afafaf]">
        {number}
      </span>
      <span className={`flex flex-col ${textColor}`}>
        <span className="text-[12px] font-bold text-[#afafaf]">{romaji}</span>
        <span className="text-[20px] font-bold">{japanese}</span>
      </span>
    </button>
  );
}

export function MeaningOptions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
      {children}
    </div>
  );
}
