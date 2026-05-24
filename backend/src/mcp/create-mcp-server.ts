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
import type { QuizAnswerForPriority } from "../services/learning/types";
import {
  getCurrentCourseContext,
  getCurrentCourseLearningContext,
  getCurrentCourseQuizResult,
} from "../services/ai-context/course-ai-context-service";

export type AdultingMcpServerDeps = {
  lessonProvider: LessonProvider;
  quizGenerationService: QuizGenerationService;
};

export type AdultingMcpRequestContext = {
  userId?: string;
  courseId?: string;
};

export function createAdultingMcpServer(
  deps: AdultingMcpServerDeps = {
    lessonProvider: defaultLessonProvider,
    quizGenerationService: defaultQuizGenerationService,
  },
  context: AdultingMcpRequestContext = {},
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
        "Use get_current_course when the user asks which course they are currently working on.",
        "Use get_current_course_quiz_result when the user asks about their quiz result.",
        "Use get_current_course_learning_context when the user asks what to focus on next.",
        "Never let the model choose userId. userId must always come from backend context.",
      ].join("\n"),
    },
  );

  registerGenerateQuizFromLessonBlocksTool(server, deps);
  registerGetLessonContextTool(server, deps);
  registerCalculateBlockPrioritiesTool(server, deps);
  registerCurrentCourseTools(server, context);

  return server;
}

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
          .describe(
            "How many questions to generate per quiz-eligible block. Default is 2.",
          ),
        language: z
          .enum(["sv", "en"])
          .optional()
          .describe("Language for questions and explanations. Default is sv."),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .optional()
          .describe(
            "Difficulty level for the generated questions. Default is medium.",
          ),
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
            saveAsDraft: input.saveAsDraft ?? false,
          });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}

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

function registerCurrentCourseTools(
  server: McpServer,
  context: AdultingMcpRequestContext,
) {
  server.registerTool(
    "get_current_course",
    {
      title: "Get current course",
      description:
        "Gets the current course from backend context. Use this when the user asks which course they are currently working on.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await getCurrentCourseContext({
          courseId: context.courseId,
        });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_current_course_quiz_result",
    {
      title: "Get current course quiz result",
      description:
        "Gets the latest quiz result for the current user and current course. The userId comes from backend context and must never be provided by the model.",
      inputSchema: {},
    },
    async () => {
      try {
        if (!context.userId) {
          throw new Error("Missing userId in MCP request context.");
        }

        const result = await getCurrentCourseQuizResult({
          userId: context.userId,
          courseId: context.courseId,
        });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_current_course_learning_context",
    {
      title: "Get current course learning context",
      description:
        "Gets both current course context and latest quiz result for the current user and course. Use this when the user asks what to focus on next.",
      inputSchema: {},
    },
    async () => {
      try {
        if (!context.userId) {
          throw new Error("Missing userId in MCP request context.");
        }

        const result = await getCurrentCourseLearningContext({
          userId: context.userId,
          courseId: context.courseId,
        });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_course_quiz_result_by_course_id",
    {
      title: "Get course quiz result by courseId",
      description:
        "Gets the latest quiz result for a specific courseId. The userId still comes from backend context and must never be provided by the model.",
      inputSchema: {
        courseId: z
          .string()
          .describe("The courseId to get quiz result for."),
      },
    },
    async ({ courseId }) => {
      try {
        if (!context.userId) {
          throw new Error("Missing userId in MCP request context.");
        }

        const result = await getCurrentCourseQuizResult({
          userId: context.userId,
          courseId,
        });

        return toStructuredToolResult(result);
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}

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