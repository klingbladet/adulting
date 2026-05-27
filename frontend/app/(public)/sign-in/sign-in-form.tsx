"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getOnboarding } from "@/lib/onboarding";

export default function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email(
        { email, password },
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
            setErrorMsg(ctx.error.message || "Kunde inte logga in");
          },
        }
      );

      if (error) setErrorMsg(error.message || "Kunde inte logga in");
    } catch {
      setErrorMsg("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full gap-4">
      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="h-14 rounded-2xl border border-transparent bg-[#EEF3FF] px-5 text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        className="mt-1 h-14 rounded-2xl bg-[#2563EB] px-4 text-base font-bold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-600">
          Har du inget konto?{" "}
          <Link href="/sign-up" className="font-bold text-[#2563EB]">
            Skapa konto
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