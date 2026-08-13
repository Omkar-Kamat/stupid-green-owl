"use client";

import { useRef } from "react";
import { COURSE_LANGUAGES } from "@/data/languages";

export function LanguageBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div
      id="language-bar"
      className="shrink-0 border-y border-duo-gray-border bg-white"
    >
      <div className="mx-auto flex max-w-[1080px] items-center px-4 md:px-6">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="shrink-0 p-2 text-duo-gray-muted hover:text-duo-gray"
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="hide-scrollbar flex flex-1 items-center gap-6 overflow-x-auto py-4"
        >
          {COURSE_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className="flex shrink-0 items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-duo-gray-muted transition-colors hover:text-duo-gray"
            >
              <span className="text-xl leading-none">{lang.icon}</span>
              {lang.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="shrink-0 p-2 text-duo-gray-muted hover:text-duo-gray"
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
