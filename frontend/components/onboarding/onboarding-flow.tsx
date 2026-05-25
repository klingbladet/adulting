"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboarding,
  saveOnboardingStep,
  skipOnboarding,
} from "@/lib/onboarding";

type StepOneData = { situation: string };
type StepTwoData = { topics: string[] };

const situations = [
  { id: "school",   label: "Jag går i skolan" },
  { id: "moving",   label: "Jag ska flytta hemifrån" },
  { id: "job",      label: "Jag söker jobb" },
  { id: "graduate", label: "Jag tar studenten snart" },
];

const topics = [
  { id: "work",      label: "Jobb",       icon: "/images/icons/jobb.jpg" },
  { id: "drivers",   label: "Körkort",    icon: "/images/icons/korkort.jpg" },
  { id: "housing",   label: "Boende",     icon: "/images/icons/bostad.jpg" },
  { id: "economy",   label: "Ekonomi",    icon: "/images/icons/ekonomi.jpg" },
  { id: "csn",       label: "CSN",        icon: "/images/icons/CSN.png" },
  { id: "skatt",     label: "Skatt",      icon: "/images/icons/skatt.png" },
  { id: "education", label: "Utbildning", icon: "/images/icons/utbildning.jpg" },
];

export default function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [stepOneData, setStepOneData] = useState<StepOneData>({ situation: "" });
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({ topics: [] });

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
        setStepOneData({
          situation:
            typeof data.stepOneData.situation === "string"
              ? data.stepOneData.situation
              : "",
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
    (step === 1 && !stepOneData.situation) ||
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

  // ── Ballongskärm ──────────────────────────────────────────────────────────
  if (showLoading) {
    const matchedLabels = stepTwoData.topics
      .map((id) => topics.find((t) => t.id === id)?.label)
      .filter(Boolean) as string[];

    return (
      <div className="w-full max-w-sm mx-auto px-6 flex flex-col items-center text-center min-h-[600px] justify-center">
        <div className="mb-8" style={{ animation: "float 3s ease-in-out infinite" }}>
          <svg width="160" height="180" viewBox="0 0 140 160" fill="none">
            <ellipse cx="20"  cy="100" rx="18" ry="10" fill="#e5e7eb" opacity="0.7"/>
            <ellipse cx="30"  cy="95"  rx="14" ry="9"  fill="#f3f4f6" opacity="0.8"/>
            <ellipse cx="120" cy="90"  rx="16" ry="9"  fill="#e5e7eb" opacity="0.7"/>
            <ellipse cx="112" cy="85"  rx="12" ry="8"  fill="#f3f4f6" opacity="0.8"/>
            <path d="M70 10 C30 10 10 45 10 70 C10 100 38 118 70 118 C102 118 130 100 130 70 C130 45 110 10 70 10Z" fill="#E84040"/>
            <path d="M70 10 C55 10 40 25 33 45 C28 60 30 80 35 95 C45 110 57 118 70 118 L70 10Z" fill="#F5C518"/>
            <path d="M70 10 C60 12 52 30 50 55 C49 70 51 90 55 105 C60 114 65 118 70 118 C75 118 80 114 85 105 C89 90 91 70 90 55 C88 30 80 12 70 10Z" fill="#38BDF8"/>
            <line x1="50" y1="115" x2="55" y2="135" stroke="#9ca3af" strokeWidth="1.5"/>
            <line x1="70" y1="118" x2="70" y2="135" stroke="#9ca3af" strokeWidth="1.5"/>
            <line x1="90" y1="115" x2="85" y2="135" stroke="#9ca3af" strokeWidth="1.5"/>
            <rect x="52" y="132" width="36" height="20" rx="5" fill="#d97706"/>
            <rect x="52" y="132" width="36" height="5"  rx="2" fill="#b45309"/>
            <line x1="64" y1="137" x2="64" y2="152" stroke="#b45309" strokeWidth="1"/>
            <line x1="76" y1="137" x2="76" y2="152" stroke="#b45309" strokeWidth="1"/>
          </svg>
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
          <div className="w-full text-left">
            <p className="text-sm font-medium text-gray-500 mb-3">Matchar med:</p>
            <div className="flex flex-wrap gap-2">
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

  // ── Huvudflöde ────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto px-5">

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* ── Steg 1 ── */}
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
              const isSelected = stepOneData.situation === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStepOneData({ situation: s.id })}
                  className={`w-full px-5 py-4 rounded-2xl border text-sm text-left transition-all duration-150 flex items-center gap-4 bg-white ${
                    isSelected ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
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

      {/* ── Steg 2 ── */}
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

          {/* Populärt — första 4 */}
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
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${
                        isSelected ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={t.icon}
                        alt={t.label}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fler områden — resten */}
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
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${
                          isSelected ? "border-blue-500" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={t.icon}
                          alt={t.label}
                          className="object-cover w-full h-full"
                        />
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
  );
}