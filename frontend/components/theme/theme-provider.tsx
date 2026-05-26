"use client";

import { useEffect } from "react";

export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "app-theme";
export const THEME_CHANGE_EVENT = "app-theme-change";

export function applyTheme(theme: AppTheme) {
  const html = document.documentElement;

  html.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  window.dispatchEvent(
    new CustomEvent<AppTheme>(THEME_CHANGE_EVENT, {
      detail: theme,
    }),
  );
}

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === "dark" ? "dark" : "light";
}

export default function ThemeProvider() {
  useEffect(() => {
    const theme = getStoredTheme();

    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, []);

  return null;
}