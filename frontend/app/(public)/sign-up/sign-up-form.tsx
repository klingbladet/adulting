"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email(
        {
          name,
          email,
          password,
        },
        {
          onSuccess: () => {
            router.push("/sign-in");
            router.refresh();
          },
          onError: (ctx) => {
            setErrorMsg(ctx.error.message || "Could not sign up");
          },
        }
      );

      if (error) {
        setErrorMsg(error.message || "Could not sign up");
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
        type="text"
        placeholder="Namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

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
        {loading ? "Skapar konto..." : "Skapa konto"}
      </button>

      <div className="mt-5 flex flex-col items-center gap-3 md:hidden">
        <p className="text-sm text-gray-600">
          Har du redan konto?{" "}
          <Link href="/sign-in" className="font-bold text-[#2563EB]">
            Logga in
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