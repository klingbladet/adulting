"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function AccountSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <SettingsPageShell title="Namn och e-post">
      <div className="space-y-4 rounded-[28px] bg-[#F8FAFC] p-5">
        <label className="block">
          <span className="text-sm font-semibold">Namn</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt namn"
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">E-post</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.com"
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <button className="h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-bold text-white">
          Spara ändringar
        </button>
      </div>
    </SettingsPageShell>
  );
}