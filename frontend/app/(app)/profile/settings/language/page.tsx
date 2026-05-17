"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState("sv");

  return (
    <SettingsPageShell title="Språk">
      <div className="space-y-3 rounded-[28px] bg-[#F8FAFC] p-5">
        {[
          { value: "sv", label: "Svenska" },
          { value: "en", label: "English" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setLanguage(item.value)}
            className={`h-12 w-full rounded-2xl text-sm font-bold ${
              language === item.value
                ? "bg-[#2563EB] text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </SettingsPageShell>
  );
}