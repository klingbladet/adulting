"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboarding,
  saveOnboardingStep,
  skipOnboarding,
} from "@/lib/onboarding";

type StepOneData = {
  categories: string[];
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
    categories: [],
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    experience: "",
  });

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    focusArea: "",
  });

  const categories = [
    { id: "economy", label: "Ekonomi" },
    { id: "housing", label: "Boende" },
    { id: "work", label: "Jobb" },
    { id: "health", label: "Hälsa" },
    { id: "relationships", label: "Relationer" },
    { id: "government", label: "Myndigheter" },
    { id: "food", label: "Mat" },
    { id: "studies", label: "Studier" },
  ];

  // NYTT
  const experienceOptions = [
    { id: "beginner", label: "Nybörjare" },
    { id: "some", label: "Lite erfarenhet" },
    { id: "confident", label: "Ganska trygg" },
    { id: "experienced", label: "Erfaren" },
  ];

  // NYTT
  const focusAreaOptions = [
    { id: "budget", label: "Budget" },
    { id: "rent", label: "Hyra" },
    { id: "government", label: "Myndigheter" },
    { id: "work", label: "Jobb" },
    { id: "health", label: "Hälsa" },
    { id: "studies", label: "Studier" },
  ];

  function toggleCategory(categoryId: string) {
    setStepOneData((current) => {
      const alreadySelected = current.categories.includes(categoryId);

      return {
        categories: alreadySelected
          ? current.categories.filter((id) => id !== categoryId)
          : [...current.categories, categoryId],
      };
    });
  }

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
          categories: Array.isArray(data.stepOneData.categories)
            ? data.stepOneData.categories.filter(
                (category): category is string => typeof category === "string"
              )
            : [],
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

  const isNextDisabled =
    saving || (step === 1 && stepOneData.categories.length === 0);

  async function handleNext() {
    if (step === 1 && stepOneData.categories.length === 0) {
      return;
    }

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
          disabled={isNextDisabled}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
        >
          Skippa
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Vad vill du lära dig mer om?</h1>
            <p className="text-sm text-muted-foreground">
              Välj en eller flera kategorier som känns relevanta för dig.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const isSelected = stepOneData.categories.includes(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {stepOneData.categories.length > 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              {stepOneData.categories.length} valda
            </p>
          ) : null}
        </div>
      ) : null}

      {/* NYTT: steg 2 med knappar precis som steg 1 */}
      {step === 2 ? (
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Hur van känner du dig?</h1>
            <p className="text-sm text-muted-foreground">
              Välj den nivå som passar dig bäst.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {experienceOptions.map((option) => {
              const isSelected = stepTwoData.experience === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStepTwoData({ experience: option.id })}
                  className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* NYTT: steg 3 med knappar precis som steg 1 */}
      {step === 3 ? (
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Vad vill du fokusera på först?</h1>
            <p className="text-sm text-muted-foreground">
              Detta kan styra vad du ser först i Learn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {focusAreaOptions.map((option) => {
              const isSelected = stepThreeData.focusArea === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStepThreeData({ focusArea: option.id })}
                  className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
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