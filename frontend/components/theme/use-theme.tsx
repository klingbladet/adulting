"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  THEME_CHANGE_EVENT,
  type AppTheme,
} from "./theme-provider";

export function useTheme() {
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());

    function handleThemeChange(event: Event) {
      const customEvent = event as CustomEvent<AppTheme>;
      setTheme(customEvent.detail);
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== "app-theme") {
        return;
      }

      setTheme(event.newValue === "dark" ? "dark" : "light");
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function setAppTheme(nextTheme: AppTheme) {
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setAppTheme(nextTheme);
  }

  return {
    theme,
    isDark: theme === "dark",
    setTheme: setAppTheme,
    toggleTheme,
  };
}