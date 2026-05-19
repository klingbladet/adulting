"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function BirthdateSettingsPage() {
  const [birthdate, setBirthdate] = useState("");

  return (
    <SettingsPageShell title="Födelsedatum">
      <div className="space-y-4 rounded-[28px] bg-[#F8FAFC] p-5">
        <label className="block">
          <span className="text-sm font-semibold">
            Födelsedatum
          </span>

          <input
            type="date"
            value={birthdate}
            onChange={(e) =>
              setBirthdate(e.target.value)
            }
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <button className="h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-bold text-white">
          Spara datum
        </button>
      </div>
    </SettingsPageShell>
  );
}