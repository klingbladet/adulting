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
        {
          email,
          password,
        },
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
            setErrorMsg(ctx.error.message || "Could not sign in");
          },
        }
      );

      if (error) {
        setErrorMsg(error.message || "Could not sign in");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-md gap-3">
      <input
        className="h-12 rounded-2xl border border-transparent bg-gray-100 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="h-12 rounded-2xl border border-transparent bg-gray-100 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#2563EB]"
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        className="mt-1 h-12 rounded-2xl bg-[#2563EB] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      <div className="mt-5 flex flex-col items-center gap-3 md:hidden">
        <p className="text-sm text-gray-600">
          Har du inget konto?{" "}
          <Link href="/sign-up" className="font-bold text-[#2563EB]">
            Skapa konto
          </Link>
        </p>

        <Link href="/auth" className="text-sm font-semibold text-gray-500">
          Tillbaka
        </Link>
      </div>

      {errorMsg ? (
        <p className="mt-2 text-center text-sm text-red-500">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}