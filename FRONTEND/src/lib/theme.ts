export type AppTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "sgo_theme";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function toggleTheme(current: AppTheme): AppTheme {
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
