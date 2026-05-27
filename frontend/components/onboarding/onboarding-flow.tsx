"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getOnboarding,
  saveOnboardingStep,
  skipOnboarding,
} from "@/lib/onboarding";
import getCourseIcon from "../courses/course-dynamic-icon";

type StepOneData = { situations: string[] };
type StepTwoData = { topics: string[] };

const situations = [
  { id: "school", label: "Jag går i skolan" },
  { id: "moving", label: "Jag ska flytta hemifrån" },
  { id: "graduate", label: "Jag tar studenten snart" },
  { id: "job", label: "Jag söker jobb" },
  { id: "other", label: "Annat" },
];

const topics = [
  { id: "work", label: "Jobb", icon: "/images/icons/jobb.jpg" },
  { id: "drivers", label: "Körkort", icon: "/images/icons/korkort.jpg" },
  { id: "housing", label: "Boende", icon: "/images/icons/bostad.jpg" },
  { id: "economy", label: "Ekonomi", icon: "/images/icons/ekonomi.jpg" },
  { id: "csn", label: "CSN", icon: "/images/icons/csn.png" },
  { id: "skatt", label: "Skatt", icon: "/images/icons/skatt.png" },
  { id: "education", label: "Utbildning", icon: "/images/icons/utbildning.jpg" },
];

type OnboardingFlowProps = {
  onShowBackgroundChange?: (show: boolean) => void;
};

export default function OnboardingFlow({
  onShowBackgroundChange,
}: OnboardingFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [stepOneData, setStepOneData] = useState<StepOneData>({ situations: [] });
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({ topics: [] });

  useEffect(() => {
    if (onShowBackgroundChange) {
      onShowBackgroundChange(!showLoading);
    }
  }, [showLoading, onShowBackgroundChange]);

  function toggleSituation(id: string) {
    setStepOneData((current) => {
      const already = current.situations.includes(id);
      return {
        situations: already
          ? current.situations.filter((s) => s !== id)
          : [...current.situations, id],
      };
    });
  }

  function toggleTopic(id: string) {
    setStepTwoData((current) => {
      const already = current.topics.includes(id);
      return {
        topics: already
          ? current.topics.filter((t) => t !== id)
          : [...current.topics, id],
      };
    });
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
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
        setStep(data.currentStep === 2 ? 2 : 1);
        let loadedSituations: string[] = [];
        if (Array.isArray(data.stepOneData.situations)) {
          loadedSituations = data.stepOneData.situations.filter(
            (s): s is string => typeof s === "string"
          );
        } else if (typeof data.stepOneData.situation === "string" && data.stepOneData.situation) {
          loadedSituations = [data.stepOneData.situation];
        }

        setStepOneData({
          situations: loadedSituations,
        });
        setStepTwoData({
          topics: Array.isArray(data.stepTwoData.topics)
            ? data.stepTwoData.topics.filter(
              (t): t is string => typeof t === "string"
            )
            : [],
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
    saving ||
    (step === 1 && stepOneData.situations.length === 0) ||
    (step === 2 && stepTwoData.topics.length === 0);

  async function handleNext() {
    setSaving(true);
    try {
      const data = step === 1 ? stepOneData : stepTwoData;
      const result = await saveOnboardingStep(step, data);
      if (step === 2) {
        setShowLoading(true);
        setSaving(false);
        setTimeout(() => {
          router.push(result.redirectTo);
          router.refresh();
        }, 3000);
        return;
      }
      setStep(2);
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
      <div className="w-full max-w-sm mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-400">Laddar...</p>
      </div>
    );
  }

  if (showLoading) {
    const matchedLabels = stepTwoData.topics
      .map((id) => topics.find((t) => t.id === id)?.label)
      .filter(Boolean) as string[];

    return (
      <div className="w-full flex flex-col items-center text-center min-h-[600px] justify-center">
        <div className="mb-8" style={{ animation: "float 3s ease-in-out infinite" }}>
          <img
            src="/images/onboarding/luftballong.gif"
            alt="Laddar"
            width={400}
            height={450}
            className="object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-5 leading-tight">
          Vi hittar<br />rätt kurser för dig!
        </h2>

        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-500"
              style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-8">Det tar bara några sekunder</p>

        {matchedLabels.length > 0 && (
          <div className="text-left">
            <p className="text-sm font-medium text-[#575757] mb-5">Matchar med:</p>
            <div className="flex justify-center flex-wrap gap-2">
              {matchedLabels.map((label) => (
                <span
                  key={label}
                  className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50%       { opacity: 1;   transform: scale(1.3); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full relative z-0">
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2563EB] transition hover:bg-blue-50 -ml-2"
          aria-label="Tillbaka"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
            />
          ))}
        </div>

        {/* Steg 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Berätta lite<br />om dig
              </h1>
              <p className="text-sm text-gray-500">Vi anpassar innehållet efter dig</p>
            </div>

            <div className="space-y-3">
              {situations.map((s) => {
                const isSelected = stepOneData.situations.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSituation(s.id)}
                    className={`w-full px-5 py-4 rounded-2xl border text-sm text-left transition-all duration-150 flex items-center gap-4 bg-white ${isSelected ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white"
                        }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" fill="currentColor" />
                        </svg>
                      )}
                    </span>
                    <span className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              className="w-full h-12 rounded-2xl bg-blue-500 text-white text-sm font-semibold transition hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Sparar..." : "Nästa"}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Hoppa över
            </button>
          </div>
        )}

        {/* Steg 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Vad vill du ha<br />hjälp med?
              </h1>
              <p className="text-sm text-gray-500">
                Välj ett eller flera ämnen som intresserar dig
              </p>
            </div>

            <div>
              <p className="text-base font-semibold text-gray-800 mb-4">Populärt</p>
              <div className="grid grid-cols-2 gap-6">
                {topics.slice(0, 4).map((t) => {
                  const isSelected = stepTwoData.topics.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopic(t.id)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${isSelected ? "border-blue-500" : "border-gray-200"
                          }`}
                      >
                        {getCourseIcon({ title: t.label })}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {topics.length > 4 && (
              <div>
                <p className="text-base font-semibold text-gray-800 mb-4">Fler områden</p>
                <div className="grid grid-cols-2 gap-6">
                  {topics.slice(4).map((t) => {
                    const isSelected = stepTwoData.topics.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTopic(t.id)}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${isSelected ? "border-blue-500" : "border-gray-200"
                            }`}
                        >
                          {getCourseIcon({ title: t.label })}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              className="w-full h-12 rounded-2xl bg-blue-500 text-white text-sm font-semibold transition hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Sparar..." : "Slutför"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}