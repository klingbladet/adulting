import { Router } from "express";
import { z } from "zod";

import {
  buildAiReadableBlocks,
  formatLessonForAssistantContext,
} from "../../services/learning/block-utils";
import {
  defaultAssistantContextService,
  buildAssistantSystemPrompt,
} from "../../services/learning/assistant-context-service";
import {
  defaultLessonProvider,
  LessonNotFoundError,
} from "../../services/learning/lesson-provider";
import {
  buildLessonFocusSummary,
  calculateBlockPrioritiesForLesson,
  createDemoAnswersForLesson,
} from "../../services/learning/priority-service";
import { defaultQuizGenerationService } from "../../services/learning/quiz-generation-service";

/**
 * Learning routes.
 *
 * Dessa routes är en REST-brygga till samma services som MCP-servern använder.
 *
 * Varför behövs de?
 *
 * MCP är bra för AI/agent-lagret, men frontend/adminpanelen bör inte behöva
 * prata direkt med MCP i första MVP:n.
 *
 * Rekommenderad väg:
 *
 * Frontend/adminpanel
 *   -> backend REST route
 *   -> learning service
 *
 * MCP tool
 *   -> samma learning service
 *
 * Det gör att:
 * - frontend blir enklare
 * - MCP kan visas separat i demo
 * - business logic inte dupliceras
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Sätt LEARNING_LESSON_PROVIDER=database
 * - Då börjar dessa routes automatiskt läsa riktiga lessons/blocks.
 *
 * TODO när quiz-tabellerna är klara:
 * - generate-quiz ska kunna spara quiz som draft i DB.
 * - Lägg då saveAsDraft: true från adminpanelen.
 */

const router = Router();

const generateQuizBodySchema = z.object({
  questionCountPerBlock: z.number().int().positive().optional(),
  language: z.enum(["sv", "en"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),

  /**
   * Just nu returnerar quiz-generation-service preview.
   *
   * TODO när quiz-tabellerna finns:
   * saveAsDraft: true ska skapa quiz + quiz_questions i databasen.
   */
  saveAsDraft: z.boolean().optional(),
});

const priorityAnswerSchema = z.object({
  blockId: z.string(),
  isCorrect: z.boolean(),
});

const calculatePrioritiesBodySchema = z.object({
  answers: z.array(priorityAnswerSchema),
  includeUnansweredBlocks: z.boolean().optional(),
});

const assistantContextBodySchema = z.object({
  userId: z.string(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  mode: z
    .enum(["general", "lesson_help", "quiz_review", "course_recommendation"])
    .optional(),
  quizAnswers: z.array(priorityAnswerSchema).optional(),
});

/**
 * GET /api/learning/health
 *
 * Enkel healthcheck för learning-routes.
 */
router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "learning-routes",
    lessonProvider: process.env.LEARNING_LESSON_PROVIDER ?? "mock",
  });
});

/**
 * GET /api/learning/lessons
 *
 * Listar lessons från aktiv LessonProvider.
 *
 * I nuläget:
 * - mock lessons
 *
 * Senare:
 * - riktiga lessons från database provider
 *
 * Bra för:
 * - snabb debug
 * - frontend dropdown
 * - Postman-test
 */
router.get("/lessons", async (_req, res) => {
  try {
    if (!defaultLessonProvider.listLessons) {
      res.status(501).json({
        error: "Current lesson provider does not support listLessons().",
      });

      return;
    }

    const lessons = await defaultLessonProvider.listLessons();

    res.status(200).json({
      lessons: lessons.map((lessonWithBlocks) => ({
        lesson: lessonWithBlocks.lesson,
        blockCount: lessonWithBlocks.blocks.length,
        quizEligibleBlockCount: buildAiReadableBlocks(
          lessonWithBlocks,
        ).filter((block) => block.shouldGenerateQuestions).length,
      })),
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * GET /api/learning/lessons/:lessonId
 *
 * Returnerar lesson + raw blocks.
 *
 * Bra för att se exakt vilket kontrakt MCP/AI-lagret får.
 */
router.get("/lessons/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lessonWithBlocks =
      await defaultLessonProvider.getLessonWithBlocks(lessonId);

    res.status(200).json(lessonWithBlocks);
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * GET /api/learning/lessons/:lessonId/context
 *
 * Returnerar AI-vänlig lesson context.
 *
 * Det här motsvarar ungefär MCP-toolen:
 *
 * get_lesson_context
 */
router.get("/lessons/:lessonId/context", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lessonWithBlocks =
      await defaultLessonProvider.getLessonWithBlocks(lessonId);

    const aiReadableBlocks = buildAiReadableBlocks(lessonWithBlocks);

    res.status(200).json({
      lesson: lessonWithBlocks.lesson,
      blocks: aiReadableBlocks,
      promptContext: formatLessonForAssistantContext(lessonWithBlocks),
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * POST /api/learning/lessons/:lessonId/generate-quiz
 *
 * Genererar quiz från lesson blocks.
 *
 * Detta motsvarar MCP-toolen:
 *
 * generate_quiz_from_lesson_blocks
 *
 * Exempel body:
 *
 * {
 *   "questionCountPerBlock": 2,
 *   "language": "sv",
 *   "difficulty": "medium",
 *   "saveAsDraft": false
 * }
 *
 * Testa med mock lesson:
 *
 * POST /api/learning/lessons/lesson_bolan_001/generate-quiz
 */
router.post("/lessons/:lessonId/generate-quiz", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const body = generateQuizBodySchema.parse(req.body ?? {});

    const result =
      await defaultQuizGenerationService.generateFromLessonBlocks({
        lessonId,
        questionCountPerBlock: body.questionCountPerBlock ?? 2,
        language: body.language ?? "sv",
        difficulty: body.difficulty ?? "medium",
        saveAsDraft: body.saveAsDraft ?? false,
      });

    res.status(201).json(result);
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * POST /api/learning/lessons/:lessonId/priorities
 *
 * Räknar blockprioritering baserat på quizsvar.
 *
 * Detta motsvarar ungefär MCP-toolen:
 *
 * calculate_block_priorities
 *
 * Exempel body:
 *
 * {
 *   "answers": [
 *     { "blockId": "block_bolan_text_001", "isCorrect": true },
 *     { "blockId": "block_bolan_text_001", "isCorrect": true },
 *     { "blockId": "block_bolan_text_002", "isCorrect": false },
 *     { "blockId": "block_bolan_text_002", "isCorrect": false }
 *   ],
 *   "includeUnansweredBlocks": true
 * }
 */
router.post("/lessons/:lessonId/priorities", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const body = calculatePrioritiesBodySchema.parse(req.body ?? {});

    const lessonWithBlocks =
      await defaultLessonProvider.getLessonWithBlocks(lessonId);

    const priorities = calculateBlockPrioritiesForLesson({
      lessonWithBlocks,
      answers: body.answers,
      includeUnansweredBlocks: body.includeUnansweredBlocks ?? true,
    });

    const focusSummary = buildLessonFocusSummary({
      lessonWithBlocks,
      answers: body.answers,
    });

    res.status(200).json({
      lessonId,
      priorities,
      focusSummary: {
        focusBlocks: focusSummary.focusBlocks,
        reviewBlocks: focusSummary.reviewBlocks,
        masteredBlocks: focusSummary.masteredBlocks,
      },
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * GET /api/learning/lessons/:lessonId/priorities/demo
 *
 * Skapar demo-svar automatiskt och räknar blockprioritering.
 *
 * Bra för:
 * - snabb demo
 * - frontend-test innan quiz player finns
 * - jury-demo om studentflödet inte är helt klart
 */
router.get("/lessons/:lessonId/priorities/demo", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lessonWithBlocks =
      await defaultLessonProvider.getLessonWithBlocks(lessonId);

    const demoAnswers = createDemoAnswersForLesson(lessonWithBlocks);

    const focusSummary = buildLessonFocusSummary({
      lessonWithBlocks,
      answers: demoAnswers,
    });

    res.status(200).json({
      lessonId,
      demoAnswers,
      priorities: focusSummary.priorities,
      focusSummary: {
        focusBlocks: focusSummary.focusBlocks,
        reviewBlocks: focusSummary.reviewBlocks,
        masteredBlocks: focusSummary.masteredBlocks,
      },
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * POST /api/learning/assistant/context
 *
 * Bygger prompt-context för AI-assistenten.
 *
 * Den här anropar inte AI-modellen.
 * Den visar bara vilken kontext som skulle skickas till modellen.
 *
 * Bra för att testa:
 * - onboarding/lärprofil
 * - lesson context
 * - quizbaserad weak-area context
 *
 * Exempel body:
 *
 * {
 *   "userId": "demo-user-1",
 *   "courseId": "course_bostad_001",
 *   "lessonId": "lesson_bolan_001",
 *   "mode": "lesson_help",
 *   "quizAnswers": [
 *     { "blockId": "block_bolan_text_002", "isCorrect": false },
 *     { "blockId": "block_bolan_text_002", "isCorrect": false }
 *   ]
 * }
 */
router.post("/assistant/context", async (req, res) => {
  try {
    const body = assistantContextBodySchema.parse(req.body ?? {});

    const context =
      await defaultAssistantContextService.buildAssistantContext({
        userId: body.userId,
        courseId: body.courseId,
        lessonId: body.lessonId,
        mode: body.mode ?? "general",
        quizAnswers: body.quizAnswers,
      });

    res.status(200).json({
      context,
      systemPromptPreview: buildAssistantSystemPrompt(
        context.promptContext,
      ),
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

/**
 * Central error handler för denna router.
 *
 * Håller svaren konsekventa och enklare att debugga.
 */
function sendRouteError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  console.error("[learning-routes] Error:", error);

  if (error instanceof LessonNotFoundError) {
    res.status(404).json({
      error: error.message,
    });

    return;
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation error",
      issues: error.issues,
    });

    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      error: error.message,
    });

    return;
  }

  res.status(500).json({
    error: "Unknown server error",
  });
}

export default router;