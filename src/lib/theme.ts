"use client";

export type AppTheme = "light" | "dark";

const THEME_KEY = "conango_theme";
type ThemeListener = (theme: AppTheme) => void;
const listeners: Set<ThemeListener> = new Set();

export function getAppTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function setAppTheme(theme: AppTheme): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  listeners.forEach((l) => l(theme));
}

export function toggleAppTheme(): AppTheme {
  const current = getAppTheme();
  const next: AppTheme = current === "dark" ? "light" : "dark";
  setAppTheme(next);
  return next;
}

export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Auto-initialize theme on load
if (typeof window !== "undefined") {
  const initial = getAppTheme();
  applyTheme(initial);
}
