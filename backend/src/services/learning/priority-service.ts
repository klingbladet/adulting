import type {
  BlockPriority,
  BlockPriorityResult,
  LessonBlock,
  LessonWithBlocks,
  QuizAnswerForPriority,
} from "./types";
import {
  blockPriorityResultSchema,
  quizAnswerForPrioritySchema,
} from "./types";
import { buildQuizSourceBlocks } from "./block-utils";

/**
 * Priority service.
 *
 * Den här filen räknar ut vilka lesson blocks eleven bör fokusera på
 * baserat på quizresultat.
 *
 * Första MVP-regeln:
 *
 * - 0/2 rätt -> high priority
 * - 1/2 rätt -> medium priority
 * - 2/2 rätt -> low priority
 *
 * Varför detta är viktigt:
 *
 * Eftersom varje quizfråga är kopplad till ett blockId kan vi räkna:
 *
 * quiz answers -> block mastery -> recommended focus blocks
 *
 * Detta är kärnan i personaliseringen.
 *
 * TODO när quiz_attempts och quiz_answers finns i databasen:
 * Skapa en funktion som hämtar answers från DB och sedan anropar
 * calculateBlockPriorities().
 */

/**
 * Intern viktning för sortering.
 *
 * Lägre siffra = högre upp i rekommenderad ordning.
 */
const PRIORITY_SORT_WEIGHT: Record<BlockPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Räknar ut priority från masteryScore.
 *
 * masteryScore betyder:
 *
 * correct / total
 *
 * Exempel:
 *
 * 0 / 2 = 0.0  -> high
 * 1 / 2 = 0.5  -> medium
 * 2 / 2 = 1.0  -> low
 */
export function getPriorityFromMasteryScore(
  masteryScore: number,
): BlockPriority {
  if (masteryScore < 0.5) {
    return "high";
  }

  if (masteryScore < 1) {
    return "medium";
  }

  return "low";
}

/**
 * Räknar masteryScore.
 *
 * Om total är 0 returnerar vi 1.
 *
 * Varför?
 * Om ett block inte har några svar ska vi inte automatiskt säga
 * att eleven är dålig på blocket.
 *
 * I vissa flöden kanske ni senare vill markera obesvarade blocks som "unknown".
 * Då kan vi lägga till en fjärde status senare.
 *
 * TODO senare:
 * Överväg priority/status:
 * - high
 * - medium
 * - low
 * - unknown
 */
export function calculateMasteryScore(correct: number, total: number): number {
  if (total <= 0) {
    return 1;
  }

  return correct / total;
}

/**
 * Grupperar quiz-svar per block.
 *
 * Input:
 *
 * [
 *   { blockId: "block_1", isCorrect: true },
 *   { blockId: "block_1", isCorrect: false },
 *   { blockId: "block_2", isCorrect: false }
 * ]
 *
 * Output:
 *
 * Map {
 *   "block_1" -> { correct: 1, total: 2 },
 *   "block_2" -> { correct: 0, total: 1 }
 * }
 */
export function groupAnswersByBlock(
  answers: QuizAnswerForPriority[],
): Map<string, { correct: number; total: number }> {
  const grouped = new Map<string, { correct: number; total: number }>();

  for (const rawAnswer of answers) {
    /**
     * Runtime validation.
     *
     * Detta gör att service-lagret är skyddat även om input kommer från:
     * - MCP tool
     * - API route
     * - frontend
     * - framtida databasadapter
     */
    const answer = quizAnswerForPrioritySchema.parse(rawAnswer);

    const current = grouped.get(answer.blockId) ?? {
      correct: 0,
      total: 0,
    };

    current.total += 1;

    if (answer.isCorrect) {
      current.correct += 1;
    }

    grouped.set(answer.blockId, current);
  }

  return grouped;
}

/**
 * Räknar blockprioritet från en lista quiz-svar.
 *
 * Den här funktionen bryr sig inte om en specifik lesson.
 * Den tittar bara på de blockIds som finns i answers.
 *
 * Bra för:
 * - MCP tool: calculate_block_priorities
 * - unit tests
 * - enkla API-routes
 */
export function calculateBlockPriorities(
  answers: QuizAnswerForPriority[],
): BlockPriorityResult[] {
  const grouped = groupAnswersByBlock(answers);

  const results = Array.from(grouped.entries()).map(([blockId, result]) => {
    const masteryScore = calculateMasteryScore(result.correct, result.total);
    const priority = getPriorityFromMasteryScore(masteryScore);

    return blockPriorityResultSchema.parse({
      blockId,
      correct: result.correct,
      total: result.total,
      masteryScore,
      priority,
    });
  });

  return sortBlockPriorityResults(results);
}

/**
 * Räknar blockprioritet för en hel lesson.
 *
 * Skillnaden mot calculateBlockPriorities():
 *
 * - Den vet vilka blocks som finns i lektionen.
 * - Den kan inkludera quizbara blocks även om de inte har några svar.
 * - Den sorterar efter priority först och original block order sedan.
 *
 * Detta är användbart för studentflödet:
 *
 * "Läs extra noga:"
 * - block med high priority
 *
 * "Det här verkar du kunna:"
 * - block med low priority
 */
export function calculateBlockPrioritiesForLesson(input: {
  lessonWithBlocks: LessonWithBlocks;
  answers: QuizAnswerForPriority[];

  /**
   * true:
   * Returnera även quizbara blocks utan svar.
   *
   * false:
   * Returnera bara blocks som faktiskt finns i answers.
   *
   * MVP-rekommendation:
   * true i studentflödet, false i ren MCP/debug-output.
   */
  includeUnansweredBlocks?: boolean;
}): BlockPriorityResult[] {
  const { lessonWithBlocks, answers } = input;
  const includeUnansweredBlocks = input.includeUnansweredBlocks ?? true;

  const grouped = groupAnswersByBlock(answers);
  const quizSourceBlocks = buildQuizSourceBlocks(lessonWithBlocks);

  const blockOrderById = new Map<string, number>(
    lessonWithBlocks.blocks.map((block) => [block.id, block.order]),
  );

  const relevantBlockIds = includeUnansweredBlocks
    ? quizSourceBlocks.map((block) => block.id)
    : Array.from(grouped.keys());

  const results = relevantBlockIds.map((blockId) => {
    const result = grouped.get(blockId) ?? {
      correct: 0,
      total: 0,
    };

    const masteryScore = calculateMasteryScore(result.correct, result.total);
    const priority = getPriorityFromMasteryScore(masteryScore);

    return blockPriorityResultSchema.parse({
      blockId,
      correct: result.correct,
      total: result.total,
      masteryScore,
      priority,
    });
  });

  return sortBlockPriorityResults(results, blockOrderById);
}

/**
 * Sorterar priority-resultat.
 *
 * Ordning:
 *
 * 1. high
 * 2. medium
 * 3. low
 *
 * Om två blocks har samma priority använder vi original block order.
 */
export function sortBlockPriorityResults(
  results: BlockPriorityResult[],
  blockOrderById?: Map<string, number>,
): BlockPriorityResult[] {
  return results.slice().sort((a, b) => {
    const priorityDiff =
      PRIORITY_SORT_WEIGHT[a.priority] - PRIORITY_SORT_WEIGHT[b.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const orderA = blockOrderById?.get(a.blockId) ?? Number.MAX_SAFE_INTEGER;
    const orderB = blockOrderById?.get(b.blockId) ?? Number.MAX_SAFE_INTEGER;

    return orderA - orderB;
  });
}

/**
 * Returnerar bara blocks med en viss priority.
 *
 * Bra för UI:
 *
 * getBlocksByPriority(..., "high")
 * -> blocks som ska visas under "Läs extra noga"
 */
export function getBlocksByPriority(input: {
  lessonWithBlocks: LessonWithBlocks;
  priorities: BlockPriorityResult[];
  priority: BlockPriority;
}): LessonBlock[] {
  const priorityBlockIds = new Set(
    input.priorities
      .filter((result) => result.priority === input.priority)
      .map((result) => result.blockId),
  );

  return input.lessonWithBlocks.blocks
    .filter((block) => priorityBlockIds.has(block.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * Skapar ett UI-vänligt summary-objekt.
 *
 * Detta kan användas direkt i studentflödet efter quizet.
 *
 * Exempel:
 *
 * {
 *   focusBlocks: [...],
 *   reviewBlocks: [...],
 *   masteredBlocks: [...]
 * }
 */
export function buildLessonFocusSummary(input: {
  lessonWithBlocks: LessonWithBlocks;
  answers: QuizAnswerForPriority[];
}) {
  const priorities = calculateBlockPrioritiesForLesson({
    lessonWithBlocks: input.lessonWithBlocks,
    answers: input.answers,
    includeUnansweredBlocks: true,
  });

  return {
    priorities,

    /**
     * Eleven bör börja här.
     */
    focusBlocks: getBlocksByPriority({
      lessonWithBlocks: input.lessonWithBlocks,
      priorities,
      priority: "high",
    }),

    /**
     * Eleven kan repetera dessa.
     */
    reviewBlocks: getBlocksByPriority({
      lessonWithBlocks: input.lessonWithBlocks,
      priorities,
      priority: "medium",
    }),

    /**
     * Eleven verkar redan ha koll på dessa.
     */
    masteredBlocks: getBlocksByPriority({
      lessonWithBlocks: input.lessonWithBlocks,
      priorities,
      priority: "low",
    }),
  };
}

/**
 * Skapar test-svar för demo.
 *
 * Den här är praktisk innan riktig quiz-attempt-data finns.
 *
 * Den simulerar:
 * - första blocket: 2/2 rätt
 * - andra blocket: 1/2 rätt
 * - tredje blocket: 0/2 rätt
 *
 * TODO när quiz_attempts finns:
 * Ta bort eller flytta denna till test/demo-fil.
 */
export function createDemoAnswersForLesson(
  lessonWithBlocks: LessonWithBlocks,
): QuizAnswerForPriority[] {
  const quizBlocks = buildQuizSourceBlocks(lessonWithBlocks);

  const answers: QuizAnswerForPriority[] = [];

  quizBlocks.forEach((block, index) => {
    if (index === 0) {
      answers.push(
        { blockId: block.id, isCorrect: true },
        { blockId: block.id, isCorrect: true },
      );

      return;
    }

    if (index === 1) {
      answers.push(
        { blockId: block.id, isCorrect: true },
        { blockId: block.id, isCorrect: false },
      );

      return;
    }

    answers.push(
      { blockId: block.id, isCorrect: false },
      { blockId: block.id, isCorrect: false },
    );
  });

  return answers;
}