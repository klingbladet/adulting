"use client";

import { useState } from "react";
import GenerateQuizPanel from "./generate-quiz-panel";
import BlockPriorityDemoPanel from "./block-priority-demo-panel";

/**
 * LearningDemoPanel
 *
 * Samlad demo för AI/MCP learning-flödet.
 *
 * Den visar två delar:
 *
 * 1. AI Quiz Generator
 *    - lesson blocks -> AI-genererade quizfrågor
 *    - varje fråga kopplas till blockId
 *
 * 2. Adaptive Learning Demo
 *    - quizsvar -> block priorities
 *    - visar vad eleven bör läsa extra noga
 *
 * Detta är perfekt medan lessonbuilder-teamet bygger klart,
 * eftersom komponenten använder mock lessonIds som redan finns i backend.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Ta emot lessonId som prop från riktig creatorpanel.
 * - Ta bort mock lesson picker om den inte behövs.
 * - Koppla "Generate quiz" till saveAsDraft: true när quiz-tabellerna är klara.
 *
 * TODO när student quiz-attempts finns:
 * - Byt demo-prioritering till riktig attempt-baserad prioritering.
 */

type DemoLessonId = "lesson_bolan_001" | "lesson_hyreskontrakt_001";

const demoLessons: Array<{
  id: DemoLessonId;
  title: string;
  description: string;
}> = [
  {
    id: "lesson_bolan_001",
    title: "Förstå bolån",
    description:
      "Demo kring bolån, ränta, amortering, kontantinsats och lånelöfte.",
  },
  {
    id: "lesson_hyreskontrakt_001",
    title: "Förstå hyreskontrakt",
    description:
      "Demo kring hyresavtal, deposition, uppsägningstid och vad man bör kontrollera.",
  },
];

type LearningDemoPanelProps = {
  /**
   * Om du skickar in lessonId används den som startvärde.
   *
   * Exempel:
   * <LearningDemoPanel initialLessonId="lesson_bolan_001" />
   */
  initialLessonId?: DemoLessonId;

  /**
   * Optional backend URL.
   *
   * Default:
   * process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"
   */
  backendUrl?: string;

  /**
   * Om true visas lesson-väljaren.
   *
   * I riktig creatorpanel kan detta sättas till false
   * och lessonId skickas från sidan.
   */
  showLessonPicker?: boolean;
};

export function LearningDemoPanel({
  initialLessonId = "lesson_bolan_001",
  backendUrl,
  showLessonPicker = true,
}: LearningDemoPanelProps) {
  const [lessonId, setLessonId] = useState<DemoLessonId>(initialLessonId);

  const activeLesson =
    demoLessons.find((lesson) => lesson.id === lessonId) ?? demoLessons[0];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              AI/MCP Learning Flow
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Adaptiv kursdemo
            </h1>

            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Den här demon visar hur en expertbyggd lektion kan omvandlas till
              quizfrågor med AI, och hur elevens quizsvar kan användas för att
              markera vilka delar av lektionen som bör prioriteras.
            </p>
          </div>

          {showLessonPicker && (
            <div className="flex min-w-full flex-col gap-2 lg:min-w-80">
              <label
                htmlFor="demo-lesson"
                className="text-sm font-medium text-foreground"
              >
                Demo-lektion
              </label>

              <select
                id="demo-lesson"
                value={lessonId}
                onChange={(event) =>
                  setLessonId(event.target.value as DemoLessonId)
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
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <DemoStepCard
            number="1"
            title="Lesson blocks"
            description="Experter skapar lektioner i block: rubrik, text, video, bild och exempel."
          />

          <DemoStepCard
            number="2"
            title="AI quiz"
            description="AI genererar frågor per quizbart block och behåller kopplingen till blockId."
          />

          <DemoStepCard
            number="3"
            title="Personalisering"
            description="Elevens svar används för att markera vilka block som behöver extra fokus."
          />
        </div>

        <div className="mt-5 rounded-xl bg-muted p-4">
          <p className="text-sm font-medium text-foreground">
            Aktiv lektion: {activeLesson.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeLesson.description}
          </p>
          <p className="mt-2 break-all text-xs text-muted-foreground">
            lessonId: {activeLesson.id}
          </p>
        </div>
      </div>

      <GenerateQuizPanel lessonId={lessonId} backendUrl={backendUrl} />

      <BlockPriorityDemoPanel lessonId={lessonId} backendUrl={backendUrl} />
    </section>
  );
}

function DemoStepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {number}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LearningDemoPanel;