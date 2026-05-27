"use client";

import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { useState } from "react";

export default function OnboardingPage() {
  const [showBackground, setShowBackground] = useState(true);

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-background text-gray-950 overflow-hidden md:p-8">
      {showBackground && (
        <img src="/images/sign-in/form-mitten-höger.png" alt="" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-80 md:w-100 z-0" />
      )}
      <section className="relative z-10 flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6 py-8 md:min-h-fit md:max-w-[480px] md:rounded-[36px] md:px-10 md:py-12">
        <OnboardingFlow onShowBackgroundChange={setShowBackground} />
      </section>
    </main>
  );
}