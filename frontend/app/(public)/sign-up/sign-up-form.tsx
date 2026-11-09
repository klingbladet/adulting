"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getOnboarding } from "@/lib/onboarding";

export default function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function startDemoOnboarding(chosenName?: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demo_onboarding_status", "not_started");
      sessionStorage.setItem("demo_onboarding_step", "1");
      sessionStorage.removeItem("demo_step_one");
      sessionStorage.removeItem("demo_step_two");
      const finalName = chosenName?.trim() || "Demo Student";
      document.cookie = `demo_user_name=${encodeURIComponent(finalName)}; path=/; max-age=86400`;
    }
    router.push("/onboarding");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setLoading(true);
      setTimeout(() => {
        startDemoOnboarding(name);
      }, 300);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Lösenorden matchar inte");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email(
        { name, email, password },
        {
          onSuccess: async () => {
            try {
              const onboarding = await getOnboarding();
              router.push(onboarding.redirectTo);
              router.refresh();
            } catch (error) {
              console.error("Could not get onboarding status:", error);
              router.push("/onboarding");
              router.refresh();
            }
          },
          onError: (ctx) => {
            setErrorMsg(ctx.error.message || "Kunde inte skapa konto");
          },
        }
      );

      if (error) setErrorMsg(error.message || "Kunde inte skapa konto");
    } catch {
      setErrorMsg("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full gap-4">
      {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-950">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-xs tracking-wider uppercase text-blue-900">
              Portfolio Demo
            </span>
          </div>
          <p className="text-xs text-blue-800/90 leading-relaxed mb-3">
            Skapa ett låtsaskonto (ingen data sparas) eller klicka nedan för att testa hela onboarding-flödet.
          </p>
          <button
            type="button"
            onClick={() => startDemoOnboarding(name)}
            className="inline-flex w-full items-center justify-center h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition cursor-pointer"
          >
            Starta Onboarding-flödet →
          </button>
        </div>
      )}

      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="text"
        placeholder="Namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
      />

      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
      />

      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
      />

      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="password"
        placeholder="Bekräfta lösenord"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
      />

      <button
        className="mt-1 h-14 rounded-2xl bg-[#2563EB] px-4 text-base font-bold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Skapar konto..." : "Skapa konto"}
      </button>

      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-600">
          Har du redan konto?{" "}
          <Link href="/sign-in" className="font-bold text-[#2563EB]">
            Logga in
          </Link>
        </p>
      </div>

      {errorMsg ? (
        <p className="mt-2 text-center text-sm font-semibold text-red-500">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
