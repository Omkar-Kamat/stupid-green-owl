"use client";

import { useEffect, useRef, useState } from "react";
import {
  SITE_LANGUAGE_OPTIONS,
  type SiteLanguageItem,
} from "@/data/languages";

const SPRITE_PATH = "/flags/site-language-sprite.svg";

function FlagIcon({ viewBox }: { viewBox: string }) {
  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="h-[19px] w-6 shrink-0 overflow-hidden rounded-[2px]"
      aria-hidden="true"
    >
      <image
        href={SPRITE_PATH}
        xlinkHref={SPRITE_PATH}
        width="82"
        height="3234"
      />
    </svg>
  );
}

function LanguageOption({
  lang,
  onSelect,
}: {
  lang: SiteLanguageItem;
  onSelect: (lang: SiteLanguageItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lang)}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-duo-gray-light transition-colors hover:bg-[#f7f7f7]"
    >
      <FlagIcon viewBox={lang.viewBox} />
      <span>{lang.label}</span>
    </button>
  );
}

export function SiteLanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SiteLanguageItem>(
    SITE_LANGUAGE_OPTIONS.find((lang) => lang.id === "en")!,
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const midpoint = Math.ceil(SITE_LANGUAGE_OPTIONS.length / 2);
  const leftColumn = SITE_LANGUAGE_OPTIONS.slice(0, midpoint);
  const rightColumn = SITE_LANGUAGE_OPTIONS.slice(midpoint);

  const handleSelect = (lang: SiteLanguageItem) => {
    setSelected(lang);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide text-duo-gray-muted transition-colors hover:text-duo-gray"
      >
        Site language: {selected.shortLabel.toUpperCase()}
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[min(92vw,560px)]">
          <div className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-duo-gray-border bg-white" />
          <div
            role="listbox"
            aria-label="Site language"
            className="relative rounded-2xl border border-duo-gray-border bg-white px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <div className="flex flex-col">
                {leftColumn.map((lang) => (
                  <LanguageOption
                    key={lang.id}
                    lang={lang}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                {rightColumn.map((lang) => (
                  <LanguageOption
                    key={lang.id}
                    lang={lang}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
