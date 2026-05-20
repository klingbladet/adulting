"use client";

import { useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <SettingsPageShell title="Lösenord">
      <div className="space-y-4 rounded-[28px] bg-[#F8FAFC] p-5">
        <label className="block">
          <span className="text-sm font-semibold">
            Nuvarande lösenord
          </span>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            placeholder="Nuvarande lösenord"
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">
            Nytt lösenord
          </span>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Nytt lösenord"
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">
            Bekräfta nytt lösenord
          </span>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Bekräfta lösenord"
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
          />
        </label>

        <button className="h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-bold text-white">
          Uppdatera lösenord
        </button>
      </div>
    </SettingsPageShell>
  );
}