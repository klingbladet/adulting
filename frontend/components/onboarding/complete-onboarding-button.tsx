"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOnboardingStatus } from "@/lib/onboarding";

export default function CompleteOnboardingButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);

    try {
      const result = await updateOnboardingStatus("completed");
      router.push(result.redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Could not complete onboarding:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading}
      className="mt-6 h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {loading ? "Sparar..." : "Slutför onboarding"}
    </button>
  );
}