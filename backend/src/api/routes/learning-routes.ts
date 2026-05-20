import { Router } from "express";
import { z } from "zod";
import { fromNodeHeaders } from "better-auth/node";
import { and, desc, eq, inArray } from "drizzle-orm";

import { auth } from "../../utils/auth";
import { db } from "../../db";

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
} from "../../services/learning/priority-service";
import { defaultQuizGenerationService } from "../../services/learning/quiz-generation-service";

import {
  quizAttempts,
  quizAnswers,
  quizQuestions,
  quizzes,
} from "../../db/schema";

const router = Router();

const generateQuizBodySchema = z.object({
  questionCountPerBlock: z.number().int().positive().optional(),
  language: z.enum(["sv", "en"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  saveAsDraft: z.boolean().optional(),
});

const submitQuizAttemptBodySchema = z.object({
  courseId: z.number().int().positive(),
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        selectedOptionId: z.string().min(1).max(1),
      }),
    )
    .min(1),
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

type QuizOption = {
  id: string;
  text: string;
};

function normalizeQuizOptions(options: unknown): QuizOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => {
      if (
        typeof option === "object" &&
        option !== null &&
        "id" in option &&
        "text" in option
      ) {
        return {
          id: String(option.id),
          text: String(option.text),
        };
      }

      return null;
    })
    .filter((option): option is QuizOption => option !== null);
}

function buildBlockPriorities(
  answers: {
    blockId: number;
    isCorrect: boolean;
  }[],
) {
  const blockStats = new Map<
    number,
    {
      blockId: number;
      correctCount: number;
      incorrectCount: number;
    }
  >();

  for (const answer of answers) {
    const current = blockStats.get(answer.blockId) ?? {
      blockId: answer.blockId,
      correctCount: 0,
      incorrectCount: 0,
    };

    if (answer.isCorrect) {
      current.correctCount += 1;
    } else {
      current.incorrectCount += 1;
    }

    blockStats.set(answer.blockId, current);
  }

  return Array.from(blockStats.values()).map((block) => {
    let priority: "high" | "medium" | "low";
    let label: string;

    if (block.correctCount === 0) {
      priority = "high";
      label = "Läs extra noggrant";
    } else if (block.incorrectCount > 0) {
      priority = "medium";
      label = "Repetera gärna";
    } else {
      priority = "low";
      label = "Det här verkar du kunna";
    }

    return {
      blockId: block.blockId,
      correctCount: block.correctCount,
      incorrectCount: block.incorrectCount,
      priority,
      label,
    };
  });
}

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
        quizEligibleBlockCount: buildAiReadableBlocks(lessonWithBlocks).filter(
          (block) => block.shouldGenerateQuestions,
        ).length,
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

router.get("/courses/:courseId/quiz", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId)) {
      res.status(400).json({
        error: "Ogiltigt courseId.",
      });
      return;
    }

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.courseId, courseId))
      .limit(1);

    if (!quiz) {
      res.status(404).json({
        error: "Quiz hittades inte för denna kurs.",
      });
      return;
    }

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id));

    const formattedQuestions = questions.map((question) => ({
      id: question.id,
      quizId: question.quizId,
      courseId: question.courseId,
      blockId: question.blockId,
      question: question.question,
      options: normalizeQuizOptions(question.options),
    }));

    res.status(200).json({
      quiz: {
        id: quiz.id,
        courseId: quiz.courseId,
        title: quiz.title,
        questions: formattedQuestions,
      },
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

router.post("/quizzes/:quizId/attempts", async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId)) {
      res.status(400).json({
        error: "Ogiltigt quizId.",
      });
      return;
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      res.status(401).json({
        error: "Du måste vara inloggad för att skicka in quiz.",
      });
      return;
    }

    const body = submitQuizAttemptBodySchema.parse(req.body ?? {});

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.courseId, body.courseId)))
      .limit(1);

    if (!quiz) {
      res.status(404).json({
        error: "Quiz hittades inte.",
      });
      return;
    }

    const questionIds = body.answers.map((answer) => answer.questionId);

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(
        and(
          eq(quizQuestions.quizId, quizId),
          eq(quizQuestions.courseId, body.courseId),
          inArray(quizQuestions.id, questionIds),
        ),
      );

    if (questions.length !== body.answers.length) {
      res.status(400).json({
        error: "Ett eller flera questionId tillhör inte detta quiz.",
      });
      return;
    }

    const answersByQuestionId = new Map(
      body.answers.map((answer) => [answer.questionId, answer]),
    );

    const checkedAnswers = questions.map((question) => {
      const submittedAnswer = answersByQuestionId.get(question.id);

      if (!submittedAnswer) {
        throw new Error(`Svar saknas för questionId ${question.id}`);
      }

      const isCorrect =
        submittedAnswer.selectedOptionId === question.correctOptionId;

      return {
        questionId: question.id,
        quizId,
        courseId: body.courseId,
        blockId: question.blockId,
        selectedOptionId: submittedAnswer.selectedOptionId,
        isCorrect,
      };
    });

    const score = checkedAnswers.filter((answer) => answer.isCorrect).length;
    const maxScore = questions.length;

    const result = await db.transaction(async (tx) => {
      const [attempt] = await tx
        .insert(quizAttempts)
        .values({
          userId: session.user.id,
          courseId: body.courseId,
          quizId,
          status: "completed",
          score,
          maxScore,
        })
        .returning();

      const answersToInsert = checkedAnswers.map((answer) => ({
        attemptId: attempt.id,
        questionId: answer.questionId,
        quizId: answer.quizId,
        courseId: answer.courseId,
        blockId: answer.blockId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: answer.isCorrect,
      }));

      const savedAnswers = await tx
        .insert(quizAnswers)
        .values(answersToInsert)
        .returning();

      return {
        attempt,
        savedAnswers,
      };
    });

    const blockPriorities = buildBlockPriorities(checkedAnswers);

    res.status(201).json({
      message: "Quiz attempt har sparats.",
      attemptId: result.attempt.id,
      score,
      maxScore,
      blockPriorities,
      answers: result.savedAnswers,
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

router.get("/courses/:courseId/personalization", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId)) {
      res.status(400).json({
        error: "Ogiltigt courseId.",
      });
      return;
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      res.status(401).json({
        error: "Du måste vara inloggad.",
      });
      return;
    }

    const [latestAttempt] = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.courseId, courseId),
          eq(quizAttempts.userId, session.user.id),
        ),
      )
      .orderBy(desc(quizAttempts.completedAt))
      .limit(1);

    if (!latestAttempt) {
      res.status(200).json({
        courseId,
        latestAttempt: null,
        blockPriorities: [],
      });
      return;
    }

    const answers = await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, latestAttempt.id));

    const blockPriorities = buildBlockPriorities(answers);

    res.status(200).json({
      courseId,
      latestAttempt: {
        id: latestAttempt.id,
        quizId: latestAttempt.quizId,
        score: latestAttempt.score,
        maxScore: latestAttempt.maxScore,
        completedAt: latestAttempt.completedAt,
      },
      blockPriorities,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

router.post("/assistant/context", async (req, res) => {
  try {
    const body = assistantContextBodySchema.parse(req.body ?? {});

    const context = await defaultAssistantContextService.buildAssistantContext({
      userId: body.userId,
      courseId: body.courseId,
      lessonId: body.lessonId,
      mode: body.mode ?? "general",
      quizAnswers: body.quizAnswers,
    });

    res.status(200).json({
      context,
      systemPromptPreview: buildAssistantSystemPrompt(context.promptContext),
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