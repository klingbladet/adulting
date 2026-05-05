"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboarding,
  saveOnboardingStep,
  skipOnboarding,
} from "@/lib/onboarding";

type StepOneData = {
  goal: string;
};

type StepTwoData = {
  experience: string;
};

type StepThreeData = {
  focusArea: string;
};

export default function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stepOneData, setStepOneData] = useState<StepOneData>({
    goal: "",
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    experience: "",
  });

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    focusArea: "",
  });

  useEffect(() => {
    async function loadOnboarding() {
      try {
        const data = await getOnboarding();

        if (
          data.onboardingStatus === "completed" ||
          data.onboardingStatus === "skipped"
        ) {
          router.push(data.redirectTo);
          return;
        }

        setStep(
          data.currentStep === 1 || data.currentStep === 2 || data.currentStep === 3
            ? data.currentStep
            : 1
        );

        setStepOneData({
          goal:
            typeof data.stepOneData.goal === "string"
              ? data.stepOneData.goal
              : "",
        });

        setStepTwoData({
          experience:
            typeof data.stepTwoData.experience === "string"
              ? data.stepTwoData.experience
              : "",
        });

        setStepThreeData({
          focusArea:
            typeof data.stepThreeData.focusArea === "string"
              ? data.stepThreeData.focusArea
              : "",
        });
      } catch (error) {
        console.error("Could not load onboarding:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOnboarding();
  }, [router]);

  async function handleNext() {
    setSaving(true);

    try {
      const data =
        step === 1 ? stepOneData : step === 2 ? stepTwoData : stepThreeData;

      const result = await saveOnboardingStep(step, data);

      if (step === 3) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      setStep(result.currentStep);
    } catch (error) {
      console.error("Could not save onboarding step:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);

    try {
      const result = await skipOnboarding();
      router.push(result.redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Could not skip onboarding:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="w-full max-w-md rounded-3xl border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Laddar onboarding...</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Steg {step} av 3
        </p>

        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
        >
          Skippa
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Vad vill du få hjälp med?</h1>
            <p className="text-sm text-muted-foreground">
              Detta hjälper oss att anpassa din upplevelse.
            </p>
          </div>

          <input
            value={stepOneData.goal}
            onChange={(e) =>
              setStepOneData({
                ...stepOneData,
                goal: e.target.value,
              })
            }
            placeholder="Ex. ekonomi, boende, jobb..."
            className="h-12 w-full rounded-xl border bg-background px-4 text-sm"
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Hur van känner du dig?</h1>
            <p className="text-sm text-muted-foreground">
              Välj eller skriv en nivå som passar dig.
            </p>
          </div>

          <input
            value={stepTwoData.experience}
            onChange={(e) =>
              setStepTwoData({
                ...stepTwoData,
                experience: e.target.value,
              })
            }
            placeholder="Ex. nybörjare, lite erfaren, trygg..."
            className="h-12 w-full rounded-xl border bg-background px-4 text-sm"
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Vad vill du fokusera på först?</h1>
            <p className="text-sm text-muted-foreground">
              Detta kan styra vad du ser först i Learn.
            </p>
          </div>

          <input
            value={stepThreeData.focusArea}
            onChange={(e) =>
              setStepThreeData({
                ...stepThreeData,
                focusArea: e.target.value,
              })
            }
            placeholder="Ex. budget, hyra, myndigheter..."
            className="h-12 w-full rounded-xl border bg-background px-4 text-sm"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleNext}
        disabled={saving}
        className="mt-8 h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {saving ? "Sparar..." : step === 3 ? "Slutför" : "Nästa"}
      </button>
    </section>
  );
}