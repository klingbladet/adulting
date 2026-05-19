"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  blockId: string;
  type: "multiple_choice";
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

type QuizPreview = {
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
};

type GenerateQuizResponse = {
  lessonId: string;
  status: "preview";
  questionsCreated: number;
  quiz: QuizPreview;
};

type GenerateCourseQuizPanelProps = {
  courseId?: string;
};

export default function GenerateCourseQuizPanel({
  courseId,
}: GenerateCourseQuizPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [quizPreview, setQuizPreview] = useState<QuizPreview | null>(null);

  async function handleGenerateQuiz() {
    if (!courseId) {
      setError("Kunde inte hitta courseId. Gå tillbaka och spara kursen först.");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      setQuizPreview(null);

      const response = await fetch(
        `${API_BASE}/api/learning/lessons/${courseId}/generate-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questionCountPerBlock: 2,
            language: "sv",
            difficulty: "medium",
            saveAsDraft: false,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte generera quiz.");
      }

      const result = data as GenerateQuizResponse;
      setQuizPreview(result.quiz);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Något gick fel när quizet skulle genereras.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Generera quiz
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Skapa AI-genererade quizfrågor från de sparade blocken.
          </p>

          {courseId ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Course ID: {courseId}
            </p>
          ) : (
            <p className="mt-2 text-sm text-red-600">
              Course ID saknas. Gå tillbaka och spara kursen först.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerateQuiz}
          disabled={isGenerating || !courseId}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Genererar quiz..." : "Generera quiz"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {quizPreview && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {quizPreview.title}
            </h3>

            <p className="text-sm text-muted-foreground">
              {quizPreview.questions.length} frågor genererade.
            </p>
          </div>

          <div className="space-y-4">
            {quizPreview.questions.map((question, index) => (
              <article
                key={`${question.blockId}-${index}`}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-foreground">
                    {index + 1}. {question.question}
                  </h4>

                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    Block {question.blockId}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {question.options.map((option) => {
                    const isCorrect = option.id === question.correctOptionId;

                    return (
                      <div
                        key={option.id}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-border bg-card text-foreground"
                        }`}
                      >
                        <span className="font-medium">{option.id}.</span>{" "}
                        {option.text}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Förklaring:
                  </span>{" "}
                  {question.explanation}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}