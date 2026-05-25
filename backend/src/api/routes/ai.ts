import { Router, Request, Response } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { aiMessages, aiThreads } from "../../db/schema";
import { auth } from "../../utils/auth";
import { SYSTEM_PROMPT } from "../../utils/ai-prompt";
import {
  buildAssistantSystemPrompt,
  defaultAssistantContextService,
} from "../../services/learning/assistant-context-service";

/**
 * Existing AI chat route, now with optional learning context.
 *
 * Detta är fortfarande er vanliga AI-chat:
 * - threads
 * - messages
 * - auth
 * - OpenRouter
 *
 * Nytt:
 * Frontend kan nu skicka learningContext när användaren är inne på en kurs/lektion.
 *
 * Exempel body till:
 * POST /api/ai/threads/:threadId/messages
 *
 * {
 *   "message": "Kan du förklara kontantinsats enklare?",
 *   "learningContext": {
 *     "courseId": "course_bostad_001",
 *     "lessonId": "lesson_bolan_001",
 *     "mode": "lesson_help",
 *     "quizAnswers": [
 *       {
 *         "blockId": "block_bolan_text_004",
 *         "isCorrect": false
 *       },
 *       {
 *         "blockId": "block_bolan_text_004",
 *         "isCorrect": false
 *       }
 *     ]
 *   }
 * }
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - lessonId ska komma från riktig kurs/lektion i frontend.
 * - LEARNING_LESSON_PROVIDER kan bytas från mock till database.
 *
 * TODO när quiz_attempts finns:
 * - Sluta skicka quizAnswers från frontend.
 * - Hämta senaste quiz attempt från DB baserat på userId + lessonId.
 */

const router = Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ||
  "meta-llama/llama-3.1-8b-instruct:free";

const aiLearningContextSchema = z
  .object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    mode: z
      .enum(["general", "lesson_help", "quiz_review", "course_recommendation"])
      .optional(),
    quizAnswers: z
      .array(
        z.object({
          blockId: z.string(),
          isCorrect: z.boolean(),
        }),
      )
      .optional(),
  })
  .optional();

const aiSettingsSchema = z
  .object({
    answerLength: z.enum(["short", "normal", "detailed"]).optional(),
    tone: z.enum(["standard", "simple", "motivating"]).optional(),
    simplifyWords: z.boolean().optional(),
    suggestNextStep: z.boolean().optional(),
    studyTips: z.boolean().optional(),
  })
  .optional()
  .nullable();

const sendMessageBodySchema = z.object({
  message: z.string().min(1),
  learningContext: aiLearningContextSchema,
  aiSettings: aiSettingsSchema,
});

type LearningContext = z.infer<typeof aiLearningContextSchema>;

function makeHeadersFromRequest(req: Request) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  return headers;
}

async function getCurrentUserId(req: Request) {
  const session = await auth.api.getSession({
    headers: makeHeadersFromRequest(req),
  });

  return session?.user?.id ?? null;
}

async function requireUser(req: Request, res: Response) {
  const userId = await getCurrentUserId(req);

  if (!userId) {
    res.status(401).json({
      error: "Du måste vara inloggad.",
    });
    return null;
  }

  return userId;
}

/**
 * Bygger systemprompt.
 *
 * Utan learningContext:
 * - använder vanliga SYSTEM_PROMPT
 *
 * Med learningContext:
 * - kombinerar vanliga SYSTEM_PROMPT med lesson-aware context
 */
async function buildLearningAwareSystemPrompt(input: {
  userId: string;
  learningContext?: LearningContext;
}) {
  const { userId, learningContext } = input;

  if (!learningContext?.lessonId && !learningContext?.courseId) {
    return SYSTEM_PROMPT;
  }

  const assistantContext =
    await defaultAssistantContextService.buildAssistantContext({
      userId,
      courseId: learningContext.courseId,
      lessonId: learningContext.lessonId,
      mode: learningContext.mode ?? "lesson_help",
      quizAnswers: learningContext.quizAnswers,
    });

  const learningSystemPrompt = buildAssistantSystemPrompt(
    assistantContext.promptContext,
  );

  return [
    SYSTEM_PROMPT,
    "",
    "========================",
    "EXTRA LEARNING CONTEXT",
    "========================",
    "",
    learningSystemPrompt,
  ].join("\n");
}

function buildAiSettingsPrompt(aiSettings?: z.infer<typeof aiSettingsSchema>) {
  if (!aiSettings) return "";

  const rules: string[] = [];

  if (aiSettings.answerLength === "short") {
    rules.push("- Svara extra kort och direkt. Max 3–5 meningar om möjligt.");
  }

  if (aiSettings.answerLength === "normal") {
    rules.push("- Svara normalt: tydligt men inte för långt.");
  }

  if (aiSettings.answerLength === "detailed") {
    rules.push("- Ge mer detaljer och förklara steg för steg när det behövs.");
  }

  if (aiSettings.tone === "simple") {
    rules.push("- Använd extra enkel svenska och undvik svåra ord.");
  }

  if (aiSettings.tone === "motivating") {
    rules.push("- Var extra peppande, varm och uppmuntrande.");
  }

  if (aiSettings.simplifyWords) {
    rules.push("- Förklara svåra ord enkelt om de dyker upp.");
  }

  if (aiSettings.suggestNextStep) {
    rules.push("- Föreslå gärna ett tydligt nästa steg.");
  }

  if (aiSettings.studyTips) {
    rules.push("- Ge små studietips när det passar frågan.");
  }

  if (rules.length === 0) return "";

  return [
    "========================",
    "USER AI SETTINGS",
    "========================",
    "",
    "Anpassa svaret efter användarens AI-inställningar:",
    ...rules,
  ].join("\n");
}

async function callOpenRouter(
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  options?: {
    systemPrompt?: string;
  },
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY saknas");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Adulting App",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: options?.systemPrompt ?? SYSTEM_PROMPT,
          },
          ...history,
        ],
        temperature: 0.7,
        max_tokens: 700,
      }),
    },
  );

  const rawText = await response.text();

  console.log("OPENROUTER STATUS:", response.status);
  console.log("OPENROUTER RAW:", rawText);

  let data: any;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("OpenRouter returnerade fel format");
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "OpenRouter kunde inte svara",
    );
  }

  const text =
    data?.choices?.[0]?.message?.content?.trim() || "";

  if (!text) {
    throw new Error("AI svarade tomt");
  }

  return text;
}

/*
========================
GET THREADS
========================
*/
router.get("/threads", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const threads = await db
      .select()
      .from(aiThreads)
      .where(eq(aiThreads.userId, userId))
      .orderBy(desc(aiThreads.updatedAt));

    res.json(threads);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Kunde inte hämta chattar",
    });
  }
});

/*
========================
CREATE THREAD
========================
*/
router.post("/threads", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const [thread] = await db
      .insert(aiThreads)
      .values({
        userId,
        title: "Ny AI-chatt",
      })
      .returning();

    res.status(201).json(thread);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Kunde inte skapa chatt",
    });
  }
});

/*
========================
DELETE THREAD
========================
*/
router.delete("/threads/:threadId", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const { threadId } = req.params;

    const [thread] = await db
      .select()
      .from(aiThreads)
      .where(
        and(
          eq(aiThreads.id, threadId),
          eq(aiThreads.userId, userId),
        ),
      );

    if (!thread) {
      return res.status(404).json({
        error: "Chat hittades inte",
      });
    }

    await db
      .delete(aiMessages)
      .where(eq(aiMessages.threadId, threadId));

    await db
      .delete(aiThreads)
      .where(eq(aiThreads.id, threadId));

    res.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Kunde inte radera chat",
    });
  }
});

/*
========================
GET THREAD MESSAGES
========================
*/
router.get("/threads/:threadId/messages", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const { threadId } = req.params;

    const [thread] = await db
      .select()
      .from(aiThreads)
      .where(
        and(
          eq(aiThreads.id, threadId),
          eq(aiThreads.userId, userId),
        ),
      );

    if (!thread) {
      return res.status(404).json({
        error: "Chat hittades inte",
      });
    }

    const messages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, threadId))
      .orderBy(asc(aiMessages.createdAt));

    res.json(messages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Kunde inte hämta meddelanden",
    });
  }
});

/*
========================
SEND MESSAGE
========================
*/
router.post("/threads/:threadId/messages", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const { threadId } = req.params;

    const parsedBody = sendMessageBodySchema.parse(req.body ?? {});
    const { message, learningContext, aiSettings } = parsedBody;

    if (!message?.trim()) {
      return res.status(400).json({
        error: "Skriv något först",
      });
    }

    const cleanMessage = message.trim();

    const [thread] = await db
      .select()
      .from(aiThreads)
      .where(
        and(
          eq(aiThreads.id, threadId),
          eq(aiThreads.userId, userId),
        ),
      );

    if (!thread) {
      return res.status(404).json({
        error: "Chat hittades inte",
      });
    }

    await db.insert(aiMessages).values({
      threadId,
      role: "user",
      content: cleanMessage,
    });

    let newTitle = thread.title;

    if (thread.title === "Ny AI-chatt") {
      newTitle = cleanMessage.slice(0, 40);
    }

    await db
      .update(aiThreads)
      .set({
        title: newTitle,
        updatedAt: new Date(),
      })
      .where(eq(aiThreads.id, threadId));

    const allMessages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, threadId))
      .orderBy(asc(aiMessages.createdAt));

    const history = allMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const learningAwareSystemPrompt =
      await buildLearningAwareSystemPrompt({
        userId,
        learningContext,
      });

    const aiSettingsPrompt = buildAiSettingsPrompt(aiSettings);

    const finalSystemPrompt = [
      learningAwareSystemPrompt,
      aiSettingsPrompt,
    ].filter(Boolean).join("\n\n");

    let aiReply = "";

    try {
      aiReply = await callOpenRouter(history, {
        systemPrompt: finalSystemPrompt,
      });
    } catch (error) {
      console.error("AI ERROR:", error);

      aiReply =
        "AI är upptagen just nu men ditt meddelande sparades. Försök igen snart.";
    }

    await db.insert(aiMessages).values({
      threadId,
      role: "assistant",
      content: aiReply,
    });

    await db
      .update(aiThreads)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(aiThreads.id, threadId));

    res.status(201).json({
      ok: true,
      threadTitle: newTitle,
      assistantMessage: aiReply,

      /**
       * Bra för debug just nu.
       *
       * TODO production:
       * Ta eventuellt bort detta fält om ni inte vill exponera det.
       */
      learningContextUsed: Boolean(
        learningContext?.lessonId || learningContext?.courseId,
      ),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        issues: error.issues,
      });
    }

    res.status(500).json({
      error: "Kunde inte skicka meddelande",
    });
  }
});

export default router;