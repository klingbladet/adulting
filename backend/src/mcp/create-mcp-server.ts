import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  buildAiReadableBlocks,
  formatLessonForAssistantContext,
} from "../services/learning/block-utils";
import {
  defaultLessonProvider,
  type LessonProvider,
} from "../services/learning/lesson-provider";
import {
  calculateBlockPriorities,
  calculateBlockPrioritiesForLesson,
} from "../services/learning/priority-service";
import {
  defaultQuizGenerationService,
  type QuizGenerationService,
} from "../services/learning/quiz-generation-service";
import type {
  QuizAnswerForPriority,
} from "../services/learning/types";

/**
 * Adulting MCP server.
 *
 * Den här filen skapar MCP-servern och registrerar de tools som AI-klienter
 * senare kan använda.
 *
 * Första MVP-tools:
 *
 * 1. generate_quiz_from_lesson_blocks
 *    Skapar quizfrågor från lesson blocks.
 *
 * 2. get_lesson_context
 *    Hämtar AI-vänlig kontext för en lektion.
 *
 * 3. calculate_block_priorities
 *    Räknar ut vilka blocks eleven bör fokusera på baserat på quizsvar.
 *
 * Viktigt:
 * Den här filen ska INTE innehålla tung business logic.
 * Tools ska bara validera input, anropa services och returnera resultat.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Byt LEARNING_LESSON_PROVIDER från "mock" till "database".
 * - get_lesson_context kommer då automatiskt hämta riktiga lesson blocks.
 *
 * TODO när quiz-tabellerna är klara:
 * - generate_quiz_from_lesson_blocks kan spara quiz som draft.
 * - saveAsDraft kan då sättas till true från adminflödet.
 */

export type AdultingMcpServerDeps = {
  lessonProvider: LessonProvider;
  quizGenerationService: QuizGenerationService;
};

export function createAdultingMcpServer(
  deps: AdultingMcpServerDeps = {
    lessonProvider: defaultLessonProvider,
    quizGenerationService: defaultQuizGenerationService,
  },
) {
  const server = new McpServer(
    {
      name: "adulting-learning-mcp",
      version: "0.1.0",
    },
    {
      instructions: [
        "This MCP server powers an adaptive learning platform for young adults.",
        "Use generate_quiz_from_lesson_blocks to create quiz drafts from lesson blocks.",
        "Use get_lesson_context before answering lesson-specific questions.",
        "Use calculate_block_priorities after quiz answers to identify what the learner should focus on.",
        "Never publish or delete user content directly from MCP tools in the MVP.",
        "Quiz generation should create drafts/previews that a human expert can review.",
      ].join("\n"),
    },
  );

  registerGenerateQuizFromLessonBlocksTool(server, deps);
  registerGetLessonContextTool(server, deps);
  registerCalculateBlockPrioritiesTool(server, deps);

  return server;
}

/**
 * Tool 1:
 * generate_quiz_from_lesson_blocks
 *
 * Den här är huvudtoolfunktionen för MCP-demo och MVP.
 *
 * Input:
 * - lessonId
 * - questionCountPerBlock
 * - language
 * - difficulty
 * - saveAsDraft
 *
 * Output:
 * - quiz preview/draft
 * - questions
 * - blockId per question
 */
function registerGenerateQuizFromLessonBlocksTool(
  server: McpServer,
  deps: AdultingMcpServerDeps,
) {
  server.registerTool(
    "generate_quiz_from_lesson_blocks",
    {
      title: "Generate quiz from lesson blocks",
      description:
        "Generates multiple-choice quiz questions from quiz-eligible lesson blocks. Each generated question is linked back to a blockId so the app can personalize the lesson based on quiz results.",
      inputSchema: {
        lessonId: z
          .string()
          .describe(
            "The lesson id. During local mock development you can use lesson_bolan_001 or lesson_hyreskontrakt_001.",
          ),
        questionCountPerBlock: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("How many questions to generate per quiz-eligible block. Default is 2."),
        language: z
          .enum(["sv", "en"])
          .optional()
          .describe("Language for questions and explanations. Default is sv."),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .optional()
          .describe("Difficulty level for the generated questions. Default is medium."),
        saveAsDraft: z
          .boolean()
          .optional()
          .describe(
            "Whether to save the generated quiz as a draft. Currently false/preview until quiz database tables are ready.",
          ),
      },
    },
    async (input) => {
      try {
        const result =
          await deps.quizGenerationService.generateFromLessonBlocks({
            lessonId: input.lessonId,
            questionCountPerBlock: input.questionCountPerBlock ?? 2,
            language: input.language ?? "sv",
            difficulty: input.difficulty ?? "medium",

            /**
             * Just nu kommer servicen returnera preview även om saveAsDraft är true,
             * eftersom DB-tabellerna inte är implementerade ännu.
             *
             * TODO när quiz-tabellerna är klara:
             * Låt saveAsDraft styra om quizet sparas i databasen.
             */
            saveAsDraft: input.saveAsDraft ?? false,
          });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}

/**
 * Tool 2:
 * get_lesson_context
 *
 * Den här gör AI-assistenten smartare.
 *
 * Den returnerar:
 * - lesson metadata
 * - blocks i AI-läsbart format
 * - full promptContext som kan skickas in i assistentprompten
 *
 * Den här kan användas innan AI:n svarar på frågor som:
 * "Kan du förklara kontantinsats enklare?"
 */
function registerGetLessonContextTool(
  server: McpServer,
  deps: AdultingMcpServerDeps,
) {
  server.registerTool(
    "get_lesson_context",
    {
      title: "Get lesson context",
      description:
        "Returns AI-readable lesson context, including ordered blocks and text content. Use this before answering questions about a specific lesson.",
      inputSchema: {
        lessonId: z
          .string()
          .describe(
            "The lesson id. During local mock development you can use lesson_bolan_001 or lesson_hyreskontrakt_001.",
          ),
      },
    },
    async ({ lessonId }) => {
      try {
        const lessonWithBlocks =
          await deps.lessonProvider.getLessonWithBlocks(lessonId);

        const aiReadableBlocks = buildAiReadableBlocks(lessonWithBlocks);

        const result = {
          lesson: lessonWithBlocks.lesson,
          blocks: aiReadableBlocks,
          promptContext: formatLessonForAssistantContext(lessonWithBlocks),
        };

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}

/**
 * Tool 3:
 * calculate_block_priorities
 *
 * Den här räknar ut vilka blocks eleven bör fokusera på baserat på quizsvar.
 *
 * Kan köras på två sätt:
 *
 * 1. Med bara answers:
 *    Då räknar vi prioritet för de blockIds som finns i answers.
 *
 * 2. Med lessonId + answers:
 *    Då hämtar vi lesson och sorterar priorities enligt lesson block order.
 *
 * Detta kräver ingen AI.
 */
function registerCalculateBlockPrioritiesTool(
  server: McpServer,
  deps: AdultingMcpServerDeps,
) {
  server.registerTool(
    "calculate_block_priorities",
    {
      title: "Calculate block priorities",
      description:
        "Calculates which lesson blocks should be prioritized based on quiz answers. 0/2 correct means high priority, 1/2 means medium, 2/2 means low.",
      inputSchema: {
        lessonId: z
          .string()
          .optional()
          .describe(
            "Optional lesson id. If provided, priorities are calculated and sorted against the lesson's quiz-eligible blocks.",
          ),
        includeUnansweredBlocks: z
          .boolean()
          .optional()
          .describe(
            "If true and lessonId is provided, include quiz-eligible blocks even if they have no answers. Default is true.",
          ),
        answers: z
          .array(
            z.object({
              blockId: z.string(),
              isCorrect: z.boolean(),
            }),
          )
          .describe(
            "Quiz answers with blockId and whether the learner answered correctly.",
          ),
      },
    },
    async ({ lessonId, includeUnansweredBlocks, answers }) => {
      try {
        const typedAnswers: QuizAnswerForPriority[] = answers;

        if (lessonId) {
          const lessonWithBlocks =
            await deps.lessonProvider.getLessonWithBlocks(lessonId);

          const result = calculateBlockPrioritiesForLesson({
            lessonWithBlocks,
            answers: typedAnswers,
            includeUnansweredBlocks: includeUnansweredBlocks ?? true,
          });

          return toStructuredToolResult({
            lessonId,
            priorities: result,
          });
        }

        const result = calculateBlockPriorities(typedAnswers);

        return toStructuredToolResult({
          priorities: result,
        });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}

/**
 * Standardiserad MCP success response.
 *
 * MCP tools returnerar alltid content.
 * structuredContent gör det enklare för klienter att läsa resultatet som data.
 */
function toStructuredToolResult<TData>(data: TData) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

/**
 * Standardiserad MCP error response.
 *
 * Viktigt:
 * Vi returnerar isError: true i stället för att kasta vidare,
 * så MCP-klienten får ett kontrollerat felsvar.
 */
function toToolErrorResult(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown MCP tool error";

  const payload = {
    error: message,
  };

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

export default createAdultingMcpServer;