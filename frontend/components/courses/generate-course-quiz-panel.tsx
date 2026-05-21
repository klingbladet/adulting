"use client";

import { useEffect, useState } from "react";

type QuizOptionId = "A" | "B" | "C" | "D";

type QuizOption = {
  id: QuizOptionId;
  text: string;
};

type QuizQuestion = {
  blockId: string;
  type: "multiple_choice";
  question: string;
  options: QuizOption[];
  correctOptionId: QuizOptionId;
  explanation?: string;
};

type QuizPreview = {
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
};

type QuizStatus = "preview" | "draft" | "published";

type GenerateQuizResponse = {
  lessonId: string;
  status: QuizStatus;
  questionsCreated: number;
  quiz: QuizPreview;
  quizId?: number | string;
  draft?: {
    quiz?: {
      id: number;
      status: string;
    };
    questions?: unknown[];
  };
};

type ExistingQuizResponse = {
  lessonId: string;
  quiz: {
    id: number;
    courseId: number;
    title: string;
    description?: string | null;
    type?: string;
    status: string;
    generatedByAi?: boolean;
  } | null;
  questions: Array<{
    id: number;
    quizId: number;
    blockId: number;
    courseId: number;
    question: string;
    options: unknown;
    correctOptionId: string;
    difficulty?: string;
    orderIndex: number;
    explanation?: string | null;
  }>;
};

type GenerateCourseQuizPanelProps = {
  courseId?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function GenerateCourseQuizPanel({
  courseId,
}: GenerateCourseQuizPanelProps) {
  const [questionCountPerBlock, setQuestionCountPerBlock] = useState(2);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const [loadingExistingQuiz, setLoadingExistingQuiz] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateQuizResponse | null>(null);

  useEffect(() => {
    async function fetchExistingQuiz() {
      if (!courseId) {
        return;
      }

      try {
        setLoadingExistingQuiz(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/learning/lessons/${courseId}/quiz`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = (await response.json()) as ExistingQuizResponse;

        if (!response.ok) {
          throw new Error("Kunde inte hämta sparat quiz.");
        }

        if (!data.quiz) {
          setResult(null);
          return;
        }

        setResult({
          lessonId: data.lessonId,
          quizId: data.quiz.id,
          status: normalizeQuizStatus(data.quiz.status),
          questionsCreated: data.questions.length,
          quiz: {
            lessonId: data.lessonId,
            title: data.quiz.title,
            questions: data.questions.map((question) => ({
              blockId: String(question.blockId),
              type: "multiple_choice",
              question: question.question,
              options: normalizeOptions(question.options),
              correctOptionId: normalizeOptionId(question.correctOptionId),
              explanation: question.explanation ?? "",
            })),
          },
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Något gick fel när quizet skulle hämtas.",
        );
      } finally {
        setLoadingExistingQuiz(false);
      }
    }

    fetchExistingQuiz();
  }, [courseId]);

  async function handleGenerateQuiz() {
    if (!courseId) {
      setError("Course ID saknas. Gå tillbaka och spara kursen först.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/learning/lessons/${courseId}/generate-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questionCountPerBlock,
            language: "sv",
            difficulty,
            saveAsDraft: true,
          }),
        },
      );

      const data = (await response.json()) as GenerateQuizResponse;

      if (!response.ok) {
        throw new Error("Kunde inte generera quiz.");
      }

      setResult({
        ...data,
        quizId: data.draft?.quiz?.id ?? data.quizId,
        status: data.draft?.quiz?.status
          ? normalizeQuizStatus(data.draft.quiz.status)
          : normalizeQuizStatus(data.status),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Något gick fel när quizet skulle genereras.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublishQuiz() {
    if (!result?.quizId) {
      setError("Quiz ID saknas. Generera eller ladda ett quiz först.");
      return;
    }

    try {
      setPublishing(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/learning/quizzes/${result.quizId}/publish`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte publicera quiz.");
      }

      setResult((current) =>
        current
          ? {
              ...current,
              status: "published",
            }
          : current,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Något gick fel när quizet skulle publiceras.",
      );
    } finally {
      setPublishing(false);
    }
  }

  const isBusy = loadingExistingQuiz || generating || publishing;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          AI Quiz Generator
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Generera quiz från kursens block
        </h2>

        <p className="max-w-2xl text-sm text-muted-foreground">
          Skapar quizfrågor från sparade block. Quizet sparas i databasen så
          det finns kvar när du går fram och tillbaka.
        </p>
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
            disabled={isBusy}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
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
            disabled={isBusy}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
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
            disabled={isBusy || !courseId}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating
              ? "Genererar quiz..."
              : result
                ? "Generera nytt quiz"
                : "Generera quiz"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium">Course ID:</span>{" "}
        {courseId ?? "saknas"}
      </div>

      {loadingExistingQuiz && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          Hämtar sparat quiz...
        </div>
      )}

      {!loadingExistingQuiz && !result && !error && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          Inget quiz har skapats ännu. Klicka på{" "}
          <span className="font-medium text-foreground">Generera quiz</span>{" "}
          för att skapa ett utkast.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sparat quiz hittades
                </p>

                <h3 className="text-lg font-semibold text-foreground">
                  {result.quiz.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {result.status}
                  </span>{" "}
                  · Frågor:{" "}
                  <span className="font-medium text-foreground">
                    {result.questionsCreated}
                  </span>
                  {result.quizId && (
                    <>
                      {" "}
                      · Quiz ID:{" "}
                      <span className="font-medium text-foreground">
                        {result.quizId}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {result.status === "published" ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                    Quizet är publicerat
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishQuiz}
                    disabled={publishing || generating || !result.quizId}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishing ? "Publicerar..." : "Publicera quiz"}
                  </button>
                )}
              </div>
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

                {question.explanation && (
                  <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Förklaring:
                    </span>{" "}
                    {question.explanation}
                  </div>
                )}
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

function normalizeOptions(options: unknown): QuizOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .filter(
      (option): option is { id: string; text: string } =>
        typeof option === "object" &&
        option !== null &&
        "id" in option &&
        "text" in option &&
        typeof option.id === "string" &&
        typeof option.text === "string",
    )
    .map((option) => ({
      id: normalizeOptionId(option.id),
      text: option.text,
    }));
}

function normalizeOptionId(value: string): QuizOptionId {
  if (value === "A" || value === "B" || value === "C" || value === "D") {
    return value;
  }

  return "A";
}

function normalizeQuizStatus(status: string): QuizStatus {
  if (status === "published") {
    return "published";
  }

  if (status === "draft") {
    return "draft";
  }

  return "draft";
}