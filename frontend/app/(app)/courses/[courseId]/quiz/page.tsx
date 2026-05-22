"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

import CourseButton from "@/components/courses/course-buttons";
import {
  getCourseQuiz,
  submitQuizAttempt,
  type CourseQuiz,
} from "@/lib/api";

type QuizPriority = {
  blockId: number;
  blockTitle?: string;
  correctCount: number;
  incorrectCount: number;
  priority: "high" | "medium" | "low";
  label: string;
};

type QuizResult = {
  message: string;
  attemptId: string;
  score: number;
  maxScore: number;
  blockPriorities: QuizPriority[];
};

export default function CourseQuizPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(
    {},
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;

  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).length;
  }, [selectedAnswers]);

  const totalQuestions = quiz?.questions.length ?? 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const selectedOptionId = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoadingQuiz(true);
        setError(null);

        const quizData = await getCourseQuiz(courseId);
        setQuiz(quizData);
      } catch (err) {
        console.error(err);
        setError("Kunde inte ladda quizet just nu.");
      } finally {
        setIsLoadingQuiz(false);
      }
    }

    loadQuiz();
  }, [courseId]);

  function handleSelectAnswer(questionId: number, optionId: string) {
    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  function handlePrevious() {
    setCurrentIndex((current) => Math.max(current - 1, 0));
  }

  function handleNext() {
    if (!quiz) return;

    setCurrentIndex((current) =>
      Math.min(current + 1, quiz.questions.length - 1),
    );
  }

  async function handleSubmit() {
    if (!quiz) return;

    const answers = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: selectedAnswers[question.id],
    }));

    const hasMissingAnswers = answers.some((answer) => !answer.selectedOptionId);

    if (hasMissingAnswers) {
      setError("Svara på alla frågor innan du skickar in quizet.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = (await submitQuizAttempt(quiz.id, {
        courseId: Number(courseId),
        answers,
      })) as QuizResult;

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte skicka in quizet just nu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingQuiz) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Laddar quiz...</p>
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Hoppsan!</h1>
        <p className="text-sm text-muted-foreground">{error}</p>

        <CourseButton onClick={() => router.push(`/courses/${courseId}`)}>
          Tillbaka till kursen
        </CourseButton>
      </main>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Inget quiz hittades</h1>

        <p className="text-sm text-muted-foreground">
          Den här kursen verkar inte ha något quiz ännu.
        </p>

        <CourseButton onClick={() => router.push(`/courses/${courseId}/overview`)}>
          Fortsätt till kursen
        </CourseButton>
      </main>
    );
  }

  if (result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Quiz klart
          </p>

          <h1 className="mb-4 text-3xl font-extrabold text-foreground">
            Du fick {result.score} av {result.maxScore} rätt
          </h1>

          <p className="text-sm text-muted-foreground">
            Vi använder resultatet för att visa vilka delar av kursen du bör
            lägga extra fokus på.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Din kursprioritering</h2>

          {result.blockPriorities.map((block) => (
            <div
              key={block.blockId}
              className="rounded-xl border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {block.blockTitle ?? `Block ${block.blockId}`}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {block.correctCount} rätt, {block.incorrectCount} fel
                  </p>
                </div>

                <PriorityBadge priority={block.priority} label={block.label} />
              </div>
            </div>
          ))}
        </section>

        <CourseButton onClick={() => router.push(`/courses/${courseId}/overview`)}>
          Se kursöversikt
          <ChevronRight size={20} />
        </CourseButton>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col p-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push(`/courses/${courseId}/personalize`)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ChevronLeft size={18} />
          Tillbaka
        </button>

        <p className="text-sm font-medium text-muted-foreground">
          Fråga {currentIndex + 1} av {totalQuestions}
        </p>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {currentQuestion && (
        <section className="flex flex-col gap-6">
              <div>
            <h1 className="text-2xl font-extrabold leading-tight text-foreground">
              {currentQuestion.question}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Välj det alternativ som passar bäst.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    handleSelectAnswer(currentQuestion.id, option.id)
                  }
                  className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-secondary"
                      : "border-border bg-card hover:border-ring"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">
                    {option.text}
                  </span>

                  <CheckCircle2
                    className={`h-5 w-5 text-primary transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-auto flex gap-3 pt-6">
            <CourseButton
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isSubmitting}
            >
              Föregående
            </CourseButton>

            {!isLastQuestion ? (
              <CourseButton
                type="button"
                onClick={handleNext}
                disabled={!selectedOptionId || isSubmitting}
              >
                Nästa
                <ChevronRight size={20} />
              </CourseButton>
            ) : (
              <CourseButton
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions || isSubmitting}
              >
                {isSubmitting ? "Skickar..." : "Skicka in quiz"}
              </CourseButton>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function PriorityBadge({
  priority,
  label,
}: {
  priority: "high" | "medium" | "low";
  label: string;
}) {
  const className =
    priority === "high"
      ? "bg-red-100 text-red-700"
      : priority === "medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}