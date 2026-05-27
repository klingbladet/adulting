"use client";

import { useEffect, useState } from "react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

type AiAnswerLength = "short" | "normal" | "detailed";
type AiTone = "standard" | "simple" | "motivating";

type AiSettings = {
  answerLength: AiAnswerLength;
  tone: AiTone;
  simplifyWords: boolean;
  suggestNextStep: boolean;
  studyTips: boolean;
};

const DEFAULT_AI_SETTINGS: AiSettings = {
  answerLength: "normal",
  tone: "standard",
  simplifyWords: true,
  suggestNextStep: true,
  studyTips: true,
};

function getStoredAiSettings(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;

  const stored = localStorage.getItem("ai-assistant-settings");

  if (!stored) return DEFAULT_AI_SETTINGS;

  try {
    return {
      ...DEFAULT_AI_SETTINGS,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export default function AiAssistantSettingsPage() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);

  useEffect(() => {
    setSettings(getStoredAiSettings());
  }, []);

  function updateSettings(nextSettings: AiSettings) {
    setSettings(nextSettings);
    localStorage.setItem("ai-assistant-settings", JSON.stringify(nextSettings));
  }

  function setAnswerLength(answerLength: AiAnswerLength) {
    updateSettings({
      ...settings,
      answerLength,
    });
  }

  function setTone(tone: AiTone) {
    updateSettings({
      ...settings,
      tone,
    });
  }

  function toggle(key: keyof Pick<AiSettings, "simplifyWords" | "suggestNextStep" | "studyTips">) {
    updateSettings({
      ...settings,
      [key]: !settings[key],
    });
  }

  return (
    <SettingsPageShell title="AI-assistent">
      <div className="space-y-5">
        <section className="rounded-[28px] bg-muted p-5 text-foreground">
          <h2 className="text-base font-bold text-foreground">
            Hur AI svarar
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Välj hur kort eller detaljerat AI ska svara.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ChoiceButton
              active={settings.answerLength === "short"}
              onClick={() => setAnswerLength("short")}
            >
              Kort
            </ChoiceButton>

            <ChoiceButton
              active={settings.answerLength === "normal"}
              onClick={() => setAnswerLength("normal")}
            >
              Normal
            </ChoiceButton>

            <ChoiceButton
              active={settings.answerLength === "detailed"}
              onClick={() => setAnswerLength("detailed")}
            >
              Detaljerad
            </ChoiceButton>
          </div>
        </section>

        <section className="rounded-[28px] bg-muted p-5 text-foreground">
          <h2 className="text-base font-bold text-foreground">
            Ton
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Anpassa känslan i svaren.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ChoiceButton
              active={settings.tone === "standard"}
              onClick={() => setTone("standard")}
            >
              Standard
            </ChoiceButton>

            <ChoiceButton
              active={settings.tone === "simple"}
              onClick={() => setTone("simple")}
            >
              Enkel
            </ChoiceButton>

            <ChoiceButton
              active={settings.tone === "motivating"}
              onClick={() => setTone("motivating")}
            >
              Peppande
            </ChoiceButton>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] bg-muted text-foreground">
          <div className="p-5">
            <h2 className="text-base font-bold text-foreground">
              Smart hjälp
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Gör AI:n mer hjälpsam i studier och vardag.
            </p>
          </div>

          <div className="divide-y divide-border/30">
            <ToggleRow
              title="Förenkla svåra ord"
              description="AI förklarar svåra ord enklare"
              checked={settings.simplifyWords}
              onChange={() => toggle("simplifyWords")}
            />

            <ToggleRow
              title="Föreslå nästa steg"
              description="AI hjälper dig komma vidare"
              checked={settings.suggestNextStep}
              onChange={() => toggle("suggestNextStep")}
            />

            <ToggleRow
              title="Visa studietips"
              description="AI kan ge små tips när det passar"
              checked={settings.studyTips}
              onChange={() => toggle("studyTips")}
            />
          </div>
        </section>
      </div>
    </SettingsPageShell>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-2xl text-sm font-bold transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground border border-border"
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}