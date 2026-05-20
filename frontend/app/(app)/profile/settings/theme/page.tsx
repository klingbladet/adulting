"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

type ThemeMode = "light" | "dark";

export default function ThemeSettingsPage() {
  const [theme, setTheme] =
    useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "app-theme"
      ) as ThemeMode | null;

    if (
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {
      setTheme(savedTheme);

      if (savedTheme === "dark") {
        document.documentElement.classList.add(
          "dark"
        );
      } else {
        document.documentElement.classList.remove(
          "dark"
        );
      }
    }
  }, []);

  function handleThemeChange(
    value: ThemeMode
  ) {
    setTheme(value);

    localStorage.setItem(
      "app-theme",
      value
    );

    if (value === "dark") {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }
  }

  return (
    <SettingsPageShell title="Tema">
      <div className="rounded-[28px] bg-[#F8FAFC] p-4">
        <p className="mb-4 text-sm text-gray-500">
          Välj hur appen ska visas på din
          enhet.
        </p>

        <div className="overflow-hidden rounded-3xl bg-white">
          <button
            type="button"
            onClick={() =>
              handleThemeChange("light")
            }
            className="flex h-16 w-full items-center gap-4 border-b px-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF7FF] text-[#2563EB]">
              <Sun size={22} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold">
                Light mode
              </p>

              <p className="text-xs text-gray-500">
                Ljus bakgrund och mörk text
              </p>
            </div>

            {theme === "light" && (
              <Check
                size={22}
                className="text-[#2563EB]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              handleThemeChange("dark")
            }
            className="flex h-16 w-full items-center gap-4 px-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF7FF] text-[#2563EB]">
              <Moon size={22} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold">
                Dark mode
              </p>

              <p className="text-xs text-gray-500">
                Mörk bakgrund och ljus text
              </p>
            </div>

            {theme === "dark" && (
              <Check
                size={22}
                className="text-[#2563EB]"
              />
            )}
          </button>
        </div>
      </div>
    </SettingsPageShell>
  );
}