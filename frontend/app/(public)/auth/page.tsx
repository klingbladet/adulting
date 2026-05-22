"use client";

import Link from "next/link";
import { ArrowLeft, Apple, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg font-bold text-[#4285F4]">
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
    <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 text-gray-950 md:min-h-screen md:py-8">
      <section className="relative min-h-dvh w-full max-w-[430px] overflow-hidden bg-white px-6 py-8 md:min-h-[760px] md:rounded-[36px] md:shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[#FBF8C6] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#E9F2E6] blur-2xl" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2563EB] transition hover:bg-blue-50"
            aria-label="Tillbaka"
          >
            <ArrowLeft size={22} />
          </Link>

          <div className="mt-20">
            <h1 className="text-[34px] font-bold leading-tight tracking-tight text-gray-950">
              Logga in /<br />
              Skapa konto
            </h1>

            <div className="mt-10 space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-14 w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 text-left text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                <GoogleIcon />
                Fortsätt med Google
              </button>

              <button
                type="button"
                className="flex h-14 w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 text-left text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                <Apple size={24} fill="currentColor" />
                Fortsätt med Apple
              </button>

              <Link
                href="/sign-in"
                className="flex h-14 w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 text-left text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                <Mail size={23} />
                Fortsätt med e-post
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/chat"
                className="text-base font-semibold text-[#2563EB]"
              >
                Eller fortsätt utan konto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}