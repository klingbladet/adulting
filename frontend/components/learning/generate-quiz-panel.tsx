"use client";

import { useState } from "react";

/**
 * GenerateQuizPanel
 *
 * Enkel frontend-komponent för att testa AI-genererat quiz från lesson blocks.
 *
 * Den anropar backend:
 *
 * POST /api/learning/lessons/:lessonId/generate-quiz
 *
 * Just nu:
 * - fungerar med mockade lessons, t.ex. lesson_bolan_001
 * - visar quizet som preview
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Skicka in riktigt lessonId från creatorpanelen.
 * - Sätt saveAsDraft: true när quiz-tabellerna är klara.
 * - Ersätt preview-listan med en riktig quiz-editor där experten kan ändra frågor.
 */

type QuizOptionId = "A" | "B" | "C" | "D";

type GeneratedQuizOption = {
  id: QuizOptionId;
  text: string;
};

type GeneratedQuizQuestion = {
  blockId: string;
  type: "multiple_choice";
  question: string;
  options: GeneratedQuizOption[];
  correctOptionId: QuizOptionId;
  explanation: string;
};

type GeneratedQuiz = {
  lessonId: string;
  title: string;
  questions: GeneratedQuizQuestion[];
};

type GenerateQuizResponse = {
  lessonId: string;
  quizId?: string;
  status: "preview" | "draft";
  questionsCreated: number;
  quiz: GeneratedQuiz;
};

type GenerateQuizPanelProps = {
  lessonId: string;

  /**
   * Optional backend URL.
   *
   * Om frontend kör i browsern lokalt är localhost:3001 rätt.
   *
   * TODO senare:
   * Lägg gärna i env:
   * NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   */
  backendUrl?: string;
};

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function GenerateQuizPanel({
  lessonId,
  backendUrl = DEFAULT_BACKEND_URL,
}: GenerateQuizPanelProps) {
  const [questionCountPerBlock, setQuestionCountPerBlock] = useState(2);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateQuizResponse | null>(null);

  async function handleGenerateQuiz() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${backendUrl}/api/learning/lessons/${lessonId}/generate-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          /**
           * I nuläget skapar vi preview.
           *
           * TODO när quiz-tabellerna finns:
           * Ändra saveAsDraft till true i creator/admin-flödet.
           */
          body: JSON.stringify({
            questionCountPerBlock,
            language: "sv",
            difficulty,
            saveAsDraft: false,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Kunde inte generera quiz.");
      }

      setResult(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Något gick fel när quizet skulle genereras.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          AI Quiz Generator
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Generera quiz från lesson blocks
          </h2>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Skapar quizfrågor från quizbara block i lektionen. Varje fråga
            kopplas till ett blockId så vi senare kan personifiera lektionen
            utifrån elevens svar.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="question-count"
            className="text-sm font-medium text-foreground"
          >
            Frågor per block
          </label>

          <select
            id="question-count"
            value={questionCountPerBlock}
            onChange={(event) =>
              setQuestionCountPerBlock(Number(event.target.value))
            }
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={1}>1 fråga</option>
            <option value={2}>2 frågor</option>
            <option value={3}>3 frågor</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="difficulty"
            className="text-sm font-medium text-foreground"
          >
            Svårighetsgrad
          </label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as "easy" | "medium" | "hard")
            }
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="easy">Lätt</option>
            <option value="medium">Medium</option>
            <option value="hard">Svår</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Genererar quiz..." : "Generera quiz"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium">Lesson ID:</span> {lessonId}
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resultat
              </p>

              <h3 className="text-lg font-semibold text-foreground">
                {result.quiz.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {result.status}
                </span>{" "}
                · Frågor skapade:{" "}
                <span className="font-medium text-foreground">
                  {result.questionsCreated}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.quiz.questions.map((question, index) => (
              <article
                key={`${question.blockId}-${index}`}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Fråga {index + 1}
                    </span>

                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Block: {question.blockId}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-foreground">
                    {question.question}
                  </h4>
                </div>

                <div className="mt-4 grid gap-2">
                  {question.options.map((option) => {
                    const isCorrect = option.id === question.correctOptionId;

                    return (
                      <div
                        key={option.id}
                        className={[
                          "rounded-lg border px-3 py-2 text-sm",
                          isCorrect
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground",
                        ].join(" ")}
                      >
                        <span className="font-semibold">{option.id}.</span>{" "}
                        {option.text}
                        {isCorrect && (
                          <span className="ml-2 text-xs font-medium text-primary">
                            Rätt svar
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Förklaring:
                  </span>{" "}
                  {question.explanation}
                </div>
              </article>
            ))}
          </div>

          <details className="rounded-xl border border-border bg-background p-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Visa rå JSON
            </summary>

            <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}

export default GenerateQuizPanel;
