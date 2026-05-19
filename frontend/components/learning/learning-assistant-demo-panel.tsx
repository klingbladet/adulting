"use client";

import { useState } from "react";

/**
 * LearningAssistantDemoPanel
 *
 * Visuell demo för en lesson-aware AI-assistent.
 *
 * Den anropar:
 *
 * POST /api/learning-assistant/chat
 *
 * Backend bygger då context från:
 * - mockad user learning profile
 * - aktuell lesson
 * - eventuella quiz answers
 * - block priorities / weak areas
 *
 * TODO när befintlig chat ska uppgraderas:
 * - Flytta denna logik till er riktiga chat-komponent.
 *
 * TODO när quiz_attempts finns:
 * - Byt demoAnswers till riktiga svar från användarens senaste quiz attempt.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Skicka in riktigt lessonId från aktuell kurs/lektion.
 */

type DemoLessonId = "lesson_bolan_001" | "lesson_hyreskontrakt_001";

type AssistantWeakArea = {
  blockId: string;
  priority: "high" | "medium" | "low";
  reason: string;
  blockTextPreview?: string;
};

type LearningAssistantResponse = {
  answer: string;
  context: {
    mode: string;
    userId: string;
    courseId?: string;
    lessonId?: string;
    hasLearningProfile: boolean;
    hasLessonContext: boolean;
    weakAreas: AssistantWeakArea[];
  };
  debug?: {
    promptContext: string;
    systemPrompt: string;
  };
};

type LearningAssistantDemoPanelProps = {
  initialLessonId?: DemoLessonId;
  backendUrl?: string;
  includeDebugContext?: boolean;
};

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const demoLessons: Array<{
  id: DemoLessonId;
  courseId: string;
  title: string;
  description: string;
  exampleQuestion: string;
  weakBlockId: string;
}> = [
  {
    id: "lesson_bolan_001",
    courseId: "course_bostad_001",
    title: "Förstå bolån",
    description:
      "AI:n får lektionens block om bolån, ränta, amortering och kontantinsats.",
    exampleQuestion: "Kan du förklara kontantinsats enklare?",
    weakBlockId: "block_bolan_text_004",
  },
  {
    id: "lesson_hyreskontrakt_001",
    courseId: "course_bostad_001",
    title: "Förstå hyreskontrakt",
    description:
      "AI:n får lektionens block om hyreskontrakt, deposition och vad man bör kontrollera.",
    exampleQuestion: "Vad ska jag kolla innan jag skriver på ett hyreskontrakt?",
    weakBlockId: "block_hyra_text_002",
  },
];

export function LearningAssistantDemoPanel({
  initialLessonId = "lesson_bolan_001",
  backendUrl = DEFAULT_BACKEND_URL,
  includeDebugContext = true,
}: LearningAssistantDemoPanelProps) {
  const [lessonId, setLessonId] = useState<DemoLessonId>(initialLessonId);
  const activeLesson =
    demoLessons.find((lesson) => lesson.id === lessonId) ?? demoLessons[0];

  const [message, setMessage] = useState(activeLesson.exampleQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LearningAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleLessonChange(nextLessonId: DemoLessonId) {
    const nextLesson =
      demoLessons.find((lesson) => lesson.id === nextLessonId) ??
      demoLessons[0];

    setLessonId(nextLesson.id);
    setMessage(nextLesson.exampleQuestion);
    setResult(null);
    setError(null);
  }

  async function handleAskAssistant() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${backendUrl}/api/learning-assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo-user-1",
          courseId: activeLesson.courseId,
          lessonId: activeLesson.id,
          mode: "lesson_help",
          message,

          /**
           * Demo: vi simulerar att eleven svarat fel på två frågor
           * kopplade till ett specifikt block.
           *
           * Då får AI-assistenten veta att detta är ett weak area.
           *
           * TODO senare:
           * Hämta detta från riktiga quiz attempts.
           */
          quizAnswers: [
            {
              blockId: activeLesson.weakBlockId,
              isCorrect: false,
            },
            {
              blockId: activeLesson.weakBlockId,
              isCorrect: false,
            },
          ],
          includeDebugContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Kunde inte fråga assistenten.");
      }

      setResult(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Något gick fel när assistenten skulle svara.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Lesson-aware AI Assistant
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Smartare AI-assistent med lesson context
          </h2>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Testa hur AI-assistenten svarar när den känner till aktuell lektion,
            användarens lärprofil och vilka block eleven verkar ha svårt med.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4 rounded-xl border border-border bg-background p-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="assistant-demo-lesson"
              className="text-sm font-medium text-foreground"
            >
              Demo-lektion
            </label>

            <select
              id="assistant-demo-lesson"
              value={lessonId}
              onChange={(event) =>
                handleLessonChange(event.target.value as DemoLessonId)
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {demoLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium text-foreground">
              {activeLesson.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {activeLesson.description}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Lesson ID:</span>{" "}
              {activeLesson.id}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">Weak block:</span>{" "}
              {activeLesson.weakBlockId}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-background p-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="assistant-question"
              className="text-sm font-medium text-foreground"
            >
              Fråga till assistenten
            </label>

            <textarea
              id="assistant-question"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="Skriv en fråga..."
            />
          </div>

          <button
            type="button"
            onClick={handleAskAssistant}
            disabled={isLoading || !message.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Assistenten tänker..." : "Fråga assistenten"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-sm font-medium text-muted-foreground">
              AI-svar
            </p>

            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.answer}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Använd context
              </h3>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <ContextRow
                  label="Learning profile"
                  value={result.context.hasLearningProfile ? "Ja" : "Nej"}
                />
                <ContextRow
                  label="Lesson context"
                  value={result.context.hasLessonContext ? "Ja" : "Nej"}
                />
                <ContextRow label="Mode" value={result.context.mode} />
                <ContextRow
                  label="Lesson ID"
                  value={result.context.lessonId ?? "-"}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Weak areas
              </h3>

              <div className="mt-3 space-y-3">
                {result.context.weakAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Inga weak areas skickades med.
                  </p>
                ) : (
                  result.context.weakAreas.map((area) => (
                    <div
                      key={area.blockId}
                      className="rounded-lg bg-muted p-3 text-sm"
                    >
                      <p className="font-medium text-foreground">
                        {area.blockId}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Priority: {area.priority}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {area.reason}
                      </p>
                      {area.blockTextPreview && (
                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                          “{area.blockTextPreview}...”
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {result.debug && (
            <details className="rounded-xl border border-border bg-background p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Visa debug prompt/context
              </summary>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Prompt context
                  </p>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                    {result.debug.promptContext}
                  </pre>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    System prompt
                  </p>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                    {result.debug.systemPrompt}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-2">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default LearningAssistantDemoPanel;
