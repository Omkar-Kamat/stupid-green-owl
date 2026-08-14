"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getStoredTheme,
  toggleTheme,
  type AppTheme,
} from "@/lib/theme";

export function ThemeToggleNavItem() {
  const [theme, setTheme] = useState<AppTheme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const label = theme === "dark" ? "Light mode" : "Dark mode";
  const showSun = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme(theme))}
      className="flex w-full items-center gap-4 rounded-2xl border-2 border-transparent px-4 py-3 text-left text-[15px] font-bold uppercase tracking-wide text-[#52656d] transition-colors hover:bg-white/5 hover:text-[#afafaf] [html[data-theme=light]_&]:text-[#777777] [html[data-theme=light]_&]:hover:bg-black/5 [html[data-theme=light]_&]:hover:text-[#4b4b4b]"
      aria-label={`Switch to ${label.toLowerCase()}`}
      suppressHydrationWarning
    >
      {showSun ? (
        <Sun className="h-7 w-7 shrink-0 text-[#ffc800]" aria-hidden="true" />
      ) : (
        <Moon className="h-7 w-7 shrink-0 text-[#afafaf]" aria-hidden="true" />
      )}
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
