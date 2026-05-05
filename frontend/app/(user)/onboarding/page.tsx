import CompleteOnboardingButton from "@/components/onboarding/complete-onboarding-button";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border bg-card p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Adulting
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Välkommen till onboarding
        </h1>

        <p className="mt-3 text-muted-foreground">
          Här kommer vi snart hjälpa dig att komma igång steg för steg.
        </p>
        <CompleteOnboardingButton />
      </section>
    </main>
  );
}

