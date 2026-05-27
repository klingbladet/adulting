"use client";

import { useEffect, useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";
import { BACKEND_URL } from "@/lib/backend-url";

type ProfileResponse = {
  user: {
    name: string;
    email: string;
  };
};

export default function AccountSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          setError("Kunde inte hämta profil.");
          return;
        }

        const data: ProfileResponse = await response.json();

        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
      } catch {
        setError("Något gick fel när profilen hämtades.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function saveChanges() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kunde inte spara ändringar.");
        return;
      }

      setMessage("Profilen har uppdaterats.");
    } catch {
      setError("Något gick fel när ändringarna sparades.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SettingsPageShell title="Namn och e-post">
        <p className="text-sm text-gray-500">Laddar...</p>
      </SettingsPageShell>
    );
  }

  return (
    <SettingsPageShell title="Namn och e-post">
      <div className="space-y-4 rounded-[28px] bg-muted p-5 text-foreground">
        <label className="block">
          <span className="text-sm font-semibold">Namn</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt namn"
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">E-post</span>
          <input
            value={email}
            disabled
            placeholder="din@email.com"
            className="mt-2 h-12 w-full rounded-2xl border border-border/50 bg-secondary px-4 text-sm text-muted-foreground outline-none opacity-70 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            E-post kan inte ändras här.
          </p>
        </label>

        {message && <p className="text-sm font-semibold text-green-500">{message}</p>}
        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-60"
        >
          {saving ? "Sparar..." : "Spara ändringar"}
        </button>
      </div>
    </SettingsPageShell>
  );
}
