"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";
import { authClient } from "@/lib/auth-client";

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updatePassword() {
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("Nytt lösenord måste vara minst 8 tecken.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    try {
      setSaving(true);

      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Lösenordet har uppdaterats.");
    } catch {
      setError(
        "Kunde inte uppdatera lösenord. Om du loggar in med Google har du inget lösenord här."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell title="Lösenord">
      <div className="space-y-4 rounded-[28px] bg-muted p-5 text-foreground">
        <label className="block">
          <span className="text-sm font-semibold">Nuvarande lösenord</span>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nuvarande lösenord"
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Nytt lösenord</span>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nytt lösenord"
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Bekräfta nytt lösenord</span>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Bekräfta lösenord"
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </label>

        {message && (
          <p className="text-sm font-semibold text-green-500">{message}</p>
        )}

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <button
          type="button"
          onClick={updatePassword}
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-60"
        >
          {saving ? "Uppdaterar..." : "Uppdatera lösenord"}
        </button>
      </div>
    </SettingsPageShell>
  );
}