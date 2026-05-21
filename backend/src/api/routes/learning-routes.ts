import { Router } from "express";
import { z } from "zod";
import {
  getLatestQuizDraftForCourse,
  saveGeneratedQuizAsDraft,
} from "../../services/learning/quiz-draft-service";
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
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { quizzes } from "../../db/schema";

const router = Router();

const generateQuizBodySchema = z.object({
  questionCountPerBlock: z.number().int().positive().optional(),
  language: z.enum(["sv", "en"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
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

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "learning-routes",
    lessonProvider: process.env.LEARNING_LESSON_PROVIDER ?? "mock",
  });
});

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

router.get("/lessons/:lessonId/quiz-draft", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const draft = await getLatestQuizDraftForCourse(lessonId);

    if (!draft) {
      res.status(200).json({
        lessonId,
        quiz: null,
        questions: [],
      });

      return;
    }

    res.status(200).json({
      lessonId,
      quiz: draft.quiz,
      questions: draft.questions,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

router.get("/lessons/:lessonId/quiz", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quiz = await getLatestQuizDraftForCourse(lessonId);

    if (!quiz) {
      res.status(200).json({
        lessonId,
        quiz: null,
        questions: [],
      });

      return;
    }

    res.status(200).json({
      lessonId,
      quiz: quiz.quiz,
      questions: quiz.questions,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

router.patch("/quizzes/:quizId/publish", async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId)) {
      res.status(400).json({
        error: "Ogiltigt quizId.",
      });
      return;
    }

    const [updatedQuiz] = await db
      .update(quizzes)
      .set({
        status: "published",
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    if (!updatedQuiz) {
      res.status(404).json({
        error: "Quiz hittades inte.",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      quiz: updatedQuiz,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

router.post("/lessons/:lessonId/generate-quiz", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const body = generateQuizBodySchema.parse(req.body ?? {});

    const difficulty = body.difficulty ?? "medium";

    const result =
      await defaultQuizGenerationService.generateFromLessonBlocks({
        lessonId,
        questionCountPerBlock: body.questionCountPerBlock ?? 2,
        language: body.language ?? "sv",
        difficulty,
        saveAsDraft: body.saveAsDraft ?? false,
      });

    if (!body.saveAsDraft) {
      res.status(201).json(result);
      return;
    }

    const draft = await saveGeneratedQuizAsDraft({
      courseId: lessonId,
      quiz: result.quiz,
      difficulty,
      createdBy: null,
    });

    res.status(201).json({
      lessonId,
      status: "draft",
      questionsCreated: result.quiz.questions.length,
      quiz: result.quiz,
      draft,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

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

function sendRouteError(
  res: { status: (code: number) => { json: (body: unknown) => void } },
  error: unknown,
) {
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