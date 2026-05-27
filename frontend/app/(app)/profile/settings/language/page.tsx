"use client";

import { useEffect, useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";
import { BACKEND_URL } from "@/lib/backend-url";

type Language = "sv" | "en";

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState<Language>("sv");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("profile-language") as Language | null;

    if (savedLanguage === "sv" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  async function saveLanguage(value: Language) {
    setLanguage(value);
    setSaving(true);
    setMessage("");

    localStorage.setItem("profile-language", value);

    try {
      await fetch(`${BACKEND_URL}/api/profile/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: value,
        }),
      });

      setMessage("Språket har sparats.");
    } catch {
      setMessage("Språket sparades lokalt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell title="Språk">
      <div className="space-y-3 rounded-[28px] bg-muted p-5 text-foreground">
        {[
          { value: "sv", label: "Svenska" },
          { value: "en", label: "English" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => saveLanguage(item.value as Language)}
            disabled={saving}
            className={`h-12 w-full rounded-2xl text-sm font-bold transition ${
              language === item.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border"
            }`}
          >
            {item.label}
          </button>
        ))}

        {message && (
          <p className="text-center text-sm font-semibold text-green-500">
            {message}
          </p>
        )}
      </div>
    </SettingsPageShell>
  );
}