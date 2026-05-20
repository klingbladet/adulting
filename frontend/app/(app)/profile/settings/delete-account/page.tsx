"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";
import { BACKEND_URL } from "@/lib/backend-url";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText === "RADERA";

  async function deleteAccount() {
    if (!canDelete) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kunde inte radera konto.");
        setDeleting(false);
        return;
      }

      localStorage.setItem("app-theme", "light");
      document.documentElement.classList.remove("dark");

      window.location.href = "/profile";
    } catch {
      setError("Något gick fel när kontot skulle raderas.");
      setDeleting(false);
    }
  }

  return (
    <SettingsPageShell title="Radera konto">
      <div className="space-y-4 rounded-[28px] bg-red-50 p-5 dark:bg-red-950/30">
        <h2 className="font-bold text-red-600">Detta går inte att ångra</h2>

        <p className="text-sm leading-6 text-red-700 dark:text-red-300">
          Om du raderar kontot tas din profil, session och sparad information
          bort. Skriv RADERA för att bekräfta.
        </p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Skriv RADERA"
          className="h-12 w-full rounded-2xl border bg-white px-4 text-sm text-gray-950 outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
        />

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="button"
          onClick={deleteAccount}
          disabled={!canDelete || deleting}
          className="h-12 w-full rounded-2xl bg-red-600 text-sm font-bold text-white disabled:opacity-40"
        >
          {deleting ? "Raderar..." : "Radera mitt konto"}
        </button>
      </div>
    </SettingsPageShell>
  );
}