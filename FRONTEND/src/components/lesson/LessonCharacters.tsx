import type { ReactNode } from "react";

export function SpeechBubble({
  children,
  showSpeaker = true,
}: {
  children: ReactNode;
  showSpeaker?: boolean;
}) {
  return (
    <div className="relative max-w-[420px] rounded-2xl border-2 border-[#37464f] bg-[#202f36] px-5 py-4">
      <div className="flex items-start gap-3">
        {showSpeaker && (
          <button
            type="button"
            className="mt-1 shrink-0 text-[#1cb0f6] hover:brightness-110"
            aria-label="Play audio"
          >
            <SpeakerIcon />
          </button>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <div className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent border-r-[#202f36]" />
    </div>
  );
}

export function FuriganaText({
  segments,
}: {
  segments: Array<{ furigana: string; text: string; dotted?: boolean }>;
}) {
  return (
    <p className="text-[22px] font-bold leading-relaxed text-white">
      {segments.map((seg, i) => (
        <span key={i} className="inline-block text-center">
          <span className="block text-[11px] font-bold text-[#afafaf]">{seg.furigana}</span>
          <span className={seg.dotted !== false ? "border-b border-dotted border-[#52656d]" : ""}>
            {seg.text}
          </span>
        </span>
      ))}
    </p>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}

export function BearCharacter() {
  return (
    <svg viewBox="0 0 120 140" className="h-[140px] w-[120px] shrink-0" aria-hidden="true">
      <ellipse cx="60" cy="75" rx="45" ry="50" fill="#8B5A2B" />
      <ellipse cx="35" cy="45" rx="18" ry="20" fill="#8B5A2B" />
      <ellipse cx="85" cy="45" rx="18" ry="20" fill="#8B5A2B" />
      <ellipse cx="35" cy="45" rx="10" ry="11" fill="#D4956A" />
      <ellipse cx="85" cy="45" rx="10" ry="11" fill="#D4956A" />
      <ellipse cx="60" cy="82" rx="28" ry="24" fill="#D4956A" />
      <ellipse cx="48" cy="72" rx="5" ry="6" fill="#3D2314" />
      <ellipse cx="72" cy="72" rx="5" ry="6" fill="#3D2314" />
      <ellipse cx="60" cy="88" rx="8" ry="6" fill="#3D2314" />
      <path d="M30 110 Q60 130 90 110" stroke="#3D2314" strokeWidth="3" fill="none" />
      <rect x="25" y="95" width="70" height="35" rx="8" fill="#7EC8E3" />
      <path d="M25 55 L15 90 L25 85 Z" fill="#8B5A2B" />
      <path d="M95 55 L105 90 L95 85 Z" fill="#8B5A2B" />
    </svg>
  );
}

export function OscarCharacter() {
  return (
    <svg viewBox="0 0 100 130" className="h-[130px] w-[100px] shrink-0" aria-hidden="true">
      <ellipse cx="50" cy="70" rx="35" ry="40" fill="#C68642" />
      <ellipse cx="50" cy="55" rx="30" ry="32" fill="#C68642" />
      <rect x="20" y="85" width="60" height="40" rx="6" fill="#FF86D0" />
      <rect x="30" y="95" width="40" height="25" rx="4" fill="#1CB0F6" />
      <ellipse cx="40" cy="52" rx="4" ry="5" fill="#3D2314" />
      <ellipse cx="60" cy="52" rx="4" ry="5" fill="#3D2314" />
      <path d="M38 65 Q50 72 62 65" stroke="#3D2314" strokeWidth="2" fill="none" />
      <path d="M35 48 Q30 35 25 30" stroke="#3D2314" strokeWidth="3" fill="none" />
      <path d="M65 48 Q70 35 75 30" stroke="#3D2314" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function LucyCharacter() {
  return (
    <svg viewBox="0 0 100 130" className="h-[130px] w-[100px] shrink-0" aria-hidden="true">
      <ellipse cx="50" cy="72" rx="32" ry="38" fill="#E8C4A0" />
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="#E8C4A0" />
      <ellipse cx="50" cy="30" rx="22" ry="18" fill="#B0B0B0" />
      <ellipse cx="42" cy="46" rx="3" ry="4" fill="#3D2314" />
      <ellipse cx="58" cy="46" rx="3" ry="4" fill="#3D2314" />
      <path d="M44 58 Q50 62 56 58" stroke="#3D2314" strokeWidth="2" fill="none" />
      <rect x="22" y="88" width="56" height="38" rx="6" fill="#FF9600" />
      <rect x="30" y="95" width="40" height="8" rx="2" fill="#FFC800" />
    </svg>
  );
}

export function ElderCharacter() {
  return (
    <svg viewBox="0 0 100 130" className="h-[130px] w-[100px] shrink-0" aria-hidden="true">
      <ellipse cx="50" cy="72" rx="32" ry="38" fill="#E8C4A0" />
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="#E8C4A0" />
      <ellipse cx="50" cy="28" rx="24" ry="16" fill="#D0D0D0" />
      <ellipse cx="42" cy="46" rx="3" ry="4" fill="#3D2314" />
      <ellipse cx="58" cy="46" rx="3" ry="4" fill="#3D2314" />
      <path d="M44 58 Q50 62 56 58" stroke="#3D2314" strokeWidth="2" fill="none" />
      <rect x="22" y="88" width="56" height="38" rx="6" fill="#FF9600" />
      <rect x="28" y="92" width="44" height="30" rx="4" fill="#FFFFFF" />
    </svg>
  );
}
