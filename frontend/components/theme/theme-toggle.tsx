"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./use-theme";

type ThemeToggleProps = {
  variant?: "button" | "row";
};

export default function ThemeToggle({ variant = "button" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex w-full items-center justify-between rounded-lg bg-card px-4 py-3 text-left text-card-foreground transition hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </div>

          <div>
            <p className="text-sm font-semibold">
              {isDark ? "Mörkt tema" : "Ljust tema"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isDark
                ? "Mörk bakgrund och ljus text"
                : "Ljus bakgrund och mörk text"}
            </p>
          </div>
        </div>

        <div
          className={`flex h-6 w-11 items-center rounded-full border border-border p-1 transition ${
            isDark ? "bg-primary" : "bg-muted"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-card shadow-sm transition ${
              isDark ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted"
      aria-label={isDark ? "Byt till ljust tema" : "Byt till mörkt tema"}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}