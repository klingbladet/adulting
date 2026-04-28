"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const darkModeActive = html.classList.contains("dark");
    setIsDark(darkModeActive);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const nextIsDark = !html.classList.contains("dark");

    html.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md border bg-card px-4 py-2 text-card-foreground"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}