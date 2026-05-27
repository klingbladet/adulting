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
    <main className="relative flex min-h-dvh items-center justify-center bg-background text-gray-950 overflow-hidden md:p-8">
      <img src="/images/sign-in/form-över-höger.png" alt="" className="pointer-events-none absolute right-0 top-0 w-80 md:w-96 z-0" />
      <img src="/images/sign-in/form-neder-vänster.png" alt="" className="pointer-events-none absolute bottom-0 left-0 w-80 md:w-96 z-0" />
      <section className="relative z-10 flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6 py-8 md:min-h-fit md:max-w-[480px] md:rounded-[36px] md:px-10 md:py-12">
        <div className="relative z-10 w-full">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2563EB] transition hover:bg-blue-50 -ml-2 pb-10"
            aria-label="Tillbaka"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
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
                href="/learn"
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