import { Router } from "express";
import { z } from "zod";

import { defaultAiClient } from "../../services/ai/ai-client";
import {
  buildAssistantSystemPrompt,
  defaultAssistantContextService,
} from "../../services/learning/assistant-context-service";

/**
 * Learning assistant routes.
 *
 * Den här routen är en säker testyta för att göra AI-assistenten smartare.
 *
 * I stället för att direkt ändra befintlig AI-chat bygger vi först:
 *
 * POST /api/learning-assistant/chat
 *
 * Den använder:
 * - assistant-context-service
 * - lesson blocks
 * - mockad onboarding/lärprofil
 * - eventuella quiz answers
 * - OpenRouter via ai-client
 *
 * TODO när befintlig chat ska uppgraderas:
 * Flytta in samma context-byggande i er nuvarande AI-route.
 *
 * TODO när onboarding är mappad:
 * Byt LEARNING_PROFILE_PROVIDER=database.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * Byt LEARNING_LESSON_PROVIDER=database.
 *
 * TODO när quiz_attempts finns:
 * Sluta skicka quizAnswers från frontend.
 * Hämta senaste quiz attempt från DB i stället.
 */

const router = Router();

const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const quizAnswerSchema = z.object({
  blockId: z.string(),
  isCorrect: z.boolean(),
});

const learningAssistantChatBodySchema = z.object({
  /**
   * I riktig app ska userId helst komma från auth/session,
   * inte från request body.
   *
   * För lokal test/demo tillåter vi body userId.
   *
   * TODO när auth kopplas:
   * Läs userId från req.user/session och gör userId optional eller ta bort från body.
   */
  userId: z.string().default("demo-user-1"),

  message: z.string().min(1),

  courseId: z.string().optional(),
  lessonId: z.string().optional(),

  mode: z
    .enum(["general", "lesson_help", "quiz_review", "course_recommendation"])
    .default("lesson_help"),

  /**
   * Optional chat history.
   *
   * Frontend kan senare skicka de senaste 5-10 meddelandena.
   */
  history: z.array(chatHistoryMessageSchema).optional(),

  /**
   * Demo: skicka quizsvar direkt.
   *
   * Senare hämtar backend detta från quiz_attempts.
   */
  quizAnswers: z.array(quizAnswerSchema).optional(),

  /**
   * Om true returnerar vi hela promptContext.
   * Bra för debug, men kanske inte i production.
   */
  includeDebugContext: z.boolean().default(true),
});

/**
 * GET /api/learning-assistant/health
 */
router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "learning-assistant-routes",
    lessonProvider: process.env.LEARNING_LESSON_PROVIDER ?? "mock",
    profileProvider: process.env.LEARNING_PROFILE_PROVIDER ?? "mock",
  });
});

/**
 * POST /api/learning-assistant/chat
 *
 * Exempel body:
 *
 * {
 *   "userId": "demo-user-1",
 *   "lessonId": "lesson_bolan_001",
 *   "courseId": "course_bostad_001",
 *   "mode": "lesson_help",
 *   "message": "Kan du förklara kontantinsats enklare?",
 *   "quizAnswers": [
 *     { "blockId": "block_bolan_text_004", "isCorrect": false },
 *     { "blockId": "block_bolan_text_004", "isCorrect": false }
 *   ]
 * }
 */
router.post("/chat", async (req, res) => {
  try {
    const body = learningAssistantChatBodySchema.parse(req.body ?? {});

    const assistantContext =
      await defaultAssistantContextService.buildAssistantContext({
        userId: body.userId,
        courseId: body.courseId,
        lessonId: body.lessonId,
        mode: body.mode,
      });

    const systemPrompt = buildAssistantSystemPrompt(
      assistantContext.promptContext,
    );

    const historyMessages =
      body.history?.map((message) => ({
        role: message.role,
        content: message.content,
      })) ?? [];

    const answer = await defaultAiClient.chat({
      temperature: 0.35,
      maxTokens: 1200,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...historyMessages,
        {
          role: "user",
          content: body.message,
        },
      ],
    });

    res.status(200).json({
      answer,
      context: {
        mode: assistantContext.mode,
        userId: assistantContext.userId,
        courseId: assistantContext.courseId,
        lessonId: assistantContext.lessonId,
        hasLearningProfile: Boolean(assistantContext.learningProfile),
        hasLessonContext: Boolean(assistantContext.lessonWithBlocks),
        weakAreas: assistantContext.weakAreas ?? [],
      },
      debug: body.includeDebugContext
        ? {
            promptContext: assistantContext.promptContext,
            systemPrompt,
          }
        : undefined,
    });
  } catch (error) {
    sendRouteError(res, error);
  }
});

function sendRouteError(
  res: {
    status: (code: number) => {
      json: (body: unknown) => void;
    };
  },
  error: unknown,
) {
  console.error("[learning-assistant-routes] Error:", error);

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