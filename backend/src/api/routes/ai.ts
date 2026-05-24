import { Router, Request, Response } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import {
  aiMessages,
  aiThreads,
  courses,
  blocks,
  quizAttempts,
  quizAnswers,
  quizQuestions,
} from "../../db/schema";
import { auth } from "../../utils/auth";
import { SYSTEM_PROMPT } from "../../utils/ai-prompt";
import {
  buildAssistantSystemPrompt,
  defaultAssistantContextService,
} from "../../services/learning/assistant-context-service";

const router = Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

const aiLearningContextSchema = z
  .object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    currentBlockId: z.string().optional(),
    mode: z
      .enum(["general", "lesson_help", "quiz_review", "course_recommendation"])
      .optional(),
  })
  .optional();

const sendMessageBodySchema = z.object({
  message: z.string().min(1),
  learningContext: aiLearningContextSchema,
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

async function getCoursePromptContext(courseId?: string) {
  if (!courseId) return "";

  const numericCourseId = Number(courseId);

  if (Number.isNaN(numericCourseId)) {
    return [`Aktuell kurs:`, `- Course ID: ${courseId}`].join("\n");
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, numericCourseId),
  });

  if (!course) {
    return [
      "Aktuell kurs:",
      `- Course ID: ${courseId}`,
      "- Kursen hittades inte i databasen.",
    ].join("\n");
  }

  return [
    "Aktuell kurs:",
    `- Course ID: ${course.id}`,
    `- Kursnamn: ${course.title}`,
    course.textContent ? `- Beskrivning: ${course.textContent}` : null,  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

async function getCourseQuizPromptContext(input: {
  userId: string;
  courseId?: string;
}) {
  const { userId, courseId } = input;

  if (!courseId) {
    return "";
  }

  const numericCourseId = Number(courseId);

  if (Number.isNaN(numericCourseId)) {
    return [
      "Quizresultat:",
      "- Inget quizresultat kunde hämtas eftersom courseId inte är numeriskt.",
    ].join("\n");
  }

  const latestAttempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.courseId, numericCourseId),
    ),
    orderBy: desc(quizAttempts.completedAt),
  });

  if (!latestAttempt) {
    return [
      "Quizresultat:",
      "- Inget quizresultat finns för den här kursen ännu.",
    ].join("\n");
  }

  const answers = await db
    .select({
      questionId: quizAnswers.questionId,
      selectedOptionId: quizAnswers.selectedOptionId,
      isCorrect: quizAnswers.isCorrect,
      blockId: quizAnswers.blockId,
      blockTitle: blocks.title,
      question: quizQuestions.question,
    })
    .from(quizAnswers)
    .leftJoin(blocks, eq(quizAnswers.blockId, blocks.id))
    .leftJoin(quizQuestions, eq(quizAnswers.questionId, quizQuestions.id))
    .where(eq(quizAnswers.attemptId, latestAttempt.id));

  const totalAnswers = answers.length;
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const incorrectAnswers = totalAnswers - correctAnswers;

  const scorePercent =
    latestAttempt.maxScore > 0
      ? Math.round((latestAttempt.score / latestAttempt.maxScore) * 100)
      : totalAnswers > 0
        ? Math.round((correctAnswers / totalAnswers) * 100)
        : 0;

  const blockStats = new Map<
    number,
    {
      blockId: number;
      blockTitle: string;
      correctCount: number;
      incorrectCount: number;
    }
  >();

  for (const answer of answers) {
    const current = blockStats.get(answer.blockId) ?? {
      blockId: answer.blockId,
      blockTitle: answer.blockTitle ?? `Block ${answer.blockId}`,
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

  const blockPriorities = Array.from(blockStats.values())
    .map((block) => {
      const totalForBlock = block.correctCount + block.incorrectCount;
      const incorrectRatio =
        totalForBlock === 0 ? 0 : block.incorrectCount / totalForBlock;

      const priority =
        incorrectRatio >= 0.6
          ? "high"
          : incorrectRatio >= 0.3
            ? "medium"
            : "low";

      return {
        ...block,
        priority,
      };
    })
    .sort((a, b) => b.incorrectCount - a.incorrectCount);

  const missedQuestions = answers
    .filter((answer) => !answer.isCorrect)
    .slice(0, 5);

  return [
    "Quizresultat:",
    `- Senaste quiz attempt ID: ${latestAttempt.id}`,
    `- Quiz ID: ${latestAttempt.quizId}`,
    `- Status: ${latestAttempt.status}`,
    `- Resultat: ${latestAttempt.score} av ${latestAttempt.maxScore}`,
    `- Procent: ${scorePercent}%`,
    `- Antal svar: ${totalAnswers}`,
    `- Rätt svar: ${correctAnswers}`,
    `- Fel svar: ${incorrectAnswers}`,
    `- Genomfördes: ${latestAttempt.completedAt.toISOString()}`,
    "",
    blockPriorities.length
      ? [
          "Blockprioritering baserat på quiz:",
          ...blockPriorities.map((block) => {
            return `- ${block.blockTitle}: ${block.correctCount} rätt, ${block.incorrectCount} fel, prioritet: ${block.priority}`;
          }),
        ].join("\n")
      : "Blockprioritering baserat på quiz: ingen blockdata hittades.",
    "",
    missedQuestions.length
      ? [
          "Frågor användaren svarade fel på:",
          ...missedQuestions.map((answer) => {
            return `- ${answer.question ?? `Fråga ${answer.questionId}`}`;
          }),
        ].join("\n")
      : "Frågor användaren svarade fel på: inga fel hittades.",
  ].join("\n");
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

function hasLearningContext(learningContext?: LearningContext) {
  return Boolean(
    learningContext?.courseId ||
      learningContext?.lessonId ||
      learningContext?.currentBlockId,
  );
}

function buildCurrentBlockPrompt(currentBlockId?: string) {
  if (!currentBlockId) return "";

  return [
    "",
    "Aktuellt block:",
    `- currentBlockId: ${currentBlockId}`,
    "",
    "Om användaren frågar om aktuell del av kursen, ta hänsyn till detta block.",
  ].join("\n");
}

async function buildLearningAwareSystemPrompt(input: {
  userId: string;
  learningContext?: LearningContext;
}) {
  const { userId, learningContext } = input;

  if (!hasLearningContext(learningContext)) {
    return SYSTEM_PROMPT;
  }

  const assistantContext =
    await defaultAssistantContextService.buildAssistantContext({
      userId,
      courseId: learningContext?.courseId,
      lessonId: learningContext?.lessonId,
      currentBlockId: learningContext?.currentBlockId,
      mode: learningContext?.mode ?? "lesson_help",
    });

  const learningSystemPrompt = buildAssistantSystemPrompt(
    assistantContext.promptContext,
  );

  const coursePromptContext = await getCoursePromptContext(
    learningContext?.courseId,
  );

  const quizPromptContext = await getCourseQuizPromptContext({
  userId,
  courseId: learningContext?.courseId,
});

  return [
  SYSTEM_PROMPT,
  "",
  "========================",
  "AKTUELL BACKEND-CONTEXT",
  "========================",
  "",
  coursePromptContext,
  "",
  quizPromptContext,
  "",
  learningSystemPrompt,
  buildCurrentBlockPrompt(learningContext?.currentBlockId),
  "",
  "Viktigt:",
  "- Om användaren frågar vilken kurs hen jobbar med, svara med kursnamnet från 'Aktuell kurs'.",
  "- Om kursnamn finns i backend-context, säg inte att du saknar kursnamnet.",
  "- Om användaren frågar hur det gick på quizet, svara med resultatet från 'Quizresultat'.",
  "- Om quizresultat finns i backend-context, säg inte att du saknar quizresultat.",
  "- Om quizresultat saknas i backend-context, säg att du inte kan se quizresultatet ännu.",
  "- Gissa aldrig quizresultat.",
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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
  });

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
    throw new Error(data?.error?.message || "OpenRouter kunde inte svara");
  }

  const text = data?.choices?.[0]?.message?.content?.trim() || "";

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
      .where(and(eq(aiThreads.id, threadId), eq(aiThreads.userId, userId)));

    if (!thread) {
      return res.status(404).json({
        error: "Chat hittades inte",
      });
    }

    await db.delete(aiMessages).where(eq(aiMessages.threadId, threadId));
    await db.delete(aiThreads).where(eq(aiThreads.id, threadId));

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
      .where(and(eq(aiThreads.id, threadId), eq(aiThreads.userId, userId)));

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
    const { message, learningContext } = parsedBody;

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        error: "Skriv något först",
      });
    }

    const [thread] = await db
      .select()
      .from(aiThreads)
      .where(and(eq(aiThreads.id, threadId), eq(aiThreads.userId, userId)));

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

    const newTitle =
      thread.title === "Ny AI-chatt" ? cleanMessage.slice(0, 40) : thread.title;

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

    const learningAwareSystemPrompt = await buildLearningAwareSystemPrompt({
      userId,
      learningContext,
    });

    let aiReply = "";

    try {
      aiReply = await callOpenRouter(history, {
        systemPrompt: learningAwareSystemPrompt,
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
      learningContextUsed: hasLearningContext(learningContext),
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