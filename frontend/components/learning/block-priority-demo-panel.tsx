"use client";

import { useState } from "react";

/**
 * BlockPriorityDemoPanel
 *
 * Visar hur quizresultat kan användas för att personifiera en lektion.
 *
 * Den anropar:
 *
 * GET /api/learning/lessons/:lessonId/priorities/demo
 *
 * Backend skapar då fejkade quizsvar och räknar ut:
 *
 * - focusBlocks: blocks eleven bör läsa extra noga
 * - reviewBlocks: blocks eleven bör repetera
 * - masteredBlocks: blocks eleven verkar kunna
 *
 * TODO när quiz-attempts finns:
 * - Byt från demo-routen till riktig route baserad på elevens quiz attempt.
 * - Exempel:
 *   GET /api/learning/quiz-attempts/:attemptId/priorities
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Denna komponent kommer fungera med riktiga lessonIds så länge backend
 *   returnerar LessonWithBlocks-formatet.
 */

type LessonBlockType = "heading" | "text" | "image" | "video" | "code" | "quote";

type LessonBlock = {
  id: string;
  lessonId: string;
  type: LessonBlockType;
  order: number;
  content: {
    text?: string;
    url?: string;
    alt?: string;
    caption?: string;
    transcript?: string;
    code?: string;
    language?: string;
  };
  quizEligible?: boolean;
};

type BlockPriority = "high" | "medium" | "low";

type BlockPriorityResult = {
  blockId: string;
  correct: number;
  total: number;
  masteryScore: number;
  priority: BlockPriority;
};

type FocusSummaryResponse = {
  lessonId: string;
  demoAnswers: Array<{
    blockId: string;
    isCorrect: boolean;
  }>;
  priorities: BlockPriorityResult[];
  focusSummary: {
    focusBlocks: LessonBlock[];
    reviewBlocks: LessonBlock[];
    masteredBlocks: LessonBlock[];
  };
};

type BlockPriorityDemoPanelProps = {
  lessonId: string;
  backendUrl?: string;
};

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function BlockPriorityDemoPanel({
  lessonId,
  backendUrl = DEFAULT_BACKEND_URL,
}: BlockPriorityDemoPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FocusSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadDemoPriorities() {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `${backendUrl}/api/learning/lessons/${lessonId}/priorities/demo`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Kunde inte hämta prioriteringar.");
      }

      setResult(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Något gick fel när prioriteringar skulle hämtas.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Adaptive Learning Demo
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Personifiera lektionen från quizresultat
          </h2>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Simulerar quizsvar och visar vilka lektionsblock eleven bör fokusera
            extra på. Detta bygger på att varje quizfråga är kopplad till ett
            blockId.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium">Lesson ID:</span> {lessonId}
        </div>

        <button
          type="button"
          onClick={handleLoadDemoPriorities}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Beräknar..." : "Visa demo-prioritering"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <PriorityColumn
              title="Läs extra noga"
              description="Block där eleven verkar behöva mest stöd."
              badge="High priority"
              blocks={result.focusSummary.focusBlocks}
              variant="high"
            />

            <PriorityColumn
              title="Repetera gärna"
              description="Block där eleven delvis verkar förstå innehållet."
              badge="Medium priority"
              blocks={result.focusSummary.reviewBlocks}
              variant="medium"
            />

            <PriorityColumn
              title="Det här verkar du kunna"
              description="Block där eleven verkar ha bra koll."
              badge="Low priority"
              blocks={result.focusSummary.masteredBlocks}
              variant="low"
            />
          </div>

          <details className="rounded-xl border border-border bg-background p-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Visa beräknade priority scores
            </summary>

            <div className="mt-4 overflow-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Block ID</th>
                    <th className="py-2 pr-4 font-medium">Rätt</th>
                    <th className="py-2 pr-4 font-medium">Totalt</th>
                    <th className="py-2 pr-4 font-medium">Mastery</th>
                    <th className="py-2 pr-4 font-medium">Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {result.priorities.map((priority) => (
                    <tr
                      key={priority.blockId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {priority.blockId}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {priority.correct}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {priority.total}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {Math.round(priority.masteryScore * 100)}%
                      </td>
                      <td className="py-2 pr-4">
                        <PriorityPill priority={priority.priority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

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

type PriorityColumnProps = {
  title: string;
  description: string;
  badge: string;
  blocks: LessonBlock[];
  variant: BlockPriority;
};

function PriorityColumn({
  title,
  description,
  badge,
  blocks,
  variant,
}: PriorityColumnProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-2">
        <PriorityPill priority={variant} label={badge} />

        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {blocks.length === 0 ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Inga block i denna kategori.
          </p>
        ) : (
          blocks.map((block) => (
            <BlockCard key={block.id} block={block} />
          ))
        )}
      </div>
    </div>
  );
}

function BlockCard({ block }: { block: LessonBlock }) {
  const preview = getBlockPreview(block);

  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          #{block.order}
        </span>

        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          {block.type}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {preview || "Inget textinnehåll att visa."}
      </p>

      <p className="mt-2 break-all text-xs text-muted-foreground">
        {block.id}
      </p>
    </article>
  );
}

function PriorityPill({
  priority,
  label,
}: {
  priority: BlockPriority;
  label?: string;
}) {
  const className =
    priority === "high"
      ? "bg-destructive/10 text-destructive"
      : priority === "medium"
        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
        : "bg-primary/10 text-primary";

  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      ].join(" ")}
    >
      {label ?? priority}
    </span>
  );
}

function getBlockPreview(block: LessonBlock): string {
  const content = block.content;

  if (block.type === "video") {
    return content.transcript ?? content.caption ?? content.url ?? "";
  }

  if (block.type === "image") {
    return content.caption ?? content.alt ?? content.url ?? "";
  }

  if (block.type === "code") {
    return content.code ?? "";
  }

  return content.text ?? "";
}

export default BlockPriorityDemoPanel;
