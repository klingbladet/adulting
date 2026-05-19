"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");

  const canDelete = confirmText === "RADERA";

  return (
    <SettingsPageShell title="Radera konto">
      <div className="space-y-4 rounded-[28px] bg-red-50 p-5">
        <h2 className="font-bold text-red-600">
          Detta går inte att ångra
        </h2>

        <p className="text-sm leading-6 text-red-700">
          Om du raderar kontot tas din profil,
          session och sparad information bort.
          Skriv RADERA för att bekräfta.
        </p>

        <input
          value={confirmText}
          onChange={(e) =>
            setConfirmText(e.target.value)
          }
          placeholder="Skriv RADERA"
          className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
        />

        <button
          disabled={!canDelete}
          className="h-12 w-full rounded-2xl bg-red-600 text-sm font-bold text-white disabled:opacity-40"
        >
          Radera mitt konto
        </button>
      </div>
    </SettingsPageShell>
  );
}