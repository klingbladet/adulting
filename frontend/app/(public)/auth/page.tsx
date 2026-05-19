"use client";

import Link from "next/link";
import { ArrowLeft, Apple, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <span className="text-2xl font-bold text-gray-900">
      G
    </span>
  );
}

export default function AuthPage() {
  async function handleGoogleLogin() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/onboarding",
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <section className="min-h-[760px] w-full max-w-[430px] rounded-[36px] bg-white px-6 py-8 shadow-sm">
        
        <Link
          href="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </Link>

        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Välj hur du vill fortsätta
          </h1>

          <div className="mt-10 space-y-4">

            <button
              onClick={handleGoogleLogin}
              className="flex h-14 w-full items-center justify-center gap-5 rounded-2xl bg-gray-100 text-base font-bold text-gray-900 transition hover:bg-gray-200"
            >
              <GoogleIcon />
              Fortsätt med Google
            </button>

            <button
              className="flex h-14 w-full items-center justify-center gap-5 rounded-2xl bg-gray-100 text-base font-bold text-gray-900 transition hover:bg-gray-200"
            >
              <Apple size={26} fill="currentColor" />
              Fortsätt med Apple
            </button>

            <Link
              href="/sign-in"
              className="flex h-14 w-full items-center justify-center gap-5 rounded-2xl bg-gray-100 text-base font-bold text-gray-900 transition hover:bg-gray-200"
            >
              <Mail size={24} fill="currentColor" />
              E-post
            </Link>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Eller
            </p>

            <Link
              href="/chat"
              className="mt-5 inline-block text-base font-bold text-[#2563EB]"
            >
              Fortsätt utan konto
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}