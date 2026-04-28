import { Router, Request, Response } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { aiMessages, aiThreads } from "../../db/schema";
import { auth } from "../../utils/auth";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `
Du är "Adulting coach", en hjälpsam AI för unga vuxna i Sverige.

Du hjälper med alla typer av frågor i vardagen.

Regler:
- Svara enkelt, tydligt och vänligt.
- Skriv på svenska om användaren gör det.
- Ge konkreta och praktiska svar.
- Om du är osäker, säg det tydligt.
- Hitta inte på fakta.
`;

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
    res.status(401).json({ error: "Du måste vara inloggad." });
    return null;
  }

  return userId;
}

async function callGemini(
  history: Array<{ role: "user" | "assistant"; content: string }>
) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY saknas i root .env");
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${SYSTEM_PROMPT}

Följ reglerna ovan i alla svar.`,
        },
      ],
    },
    ...history.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700,
        },
      }),
    }
  );

  const rawText = await response.text();
  console.log("GEMINI STATUS:", response.status);
  console.log("GEMINI RAW:", rawText);

  let data: any = null;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Gemini returnerade ogiltig JSON: ${rawText}`);
  }

  if (!response.ok) {
    const message = data?.error?.message || "Gemini kunde inte svara.";

    if (
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate") ||
      message.toLowerCase().includes("resource exhausted")
    ) {
      throw new Error(
        "AI är tillfälligt upptagen eller quota är slut. Försök igen om en stund."
      );
    }

    throw new Error(message);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("AI svarade tomt.");
  }

  return text;
}

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
    console.error("GET THREADS ERROR:", error);
    res.status(500).json({ error: "Kunde inte hämta chattar." });
  }
});

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
    console.error("CREATE THREAD ERROR:", error);
    res.status(500).json({ error: "Kunde inte skapa ny chatt." });
  }
});

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
      return res.status(404).json({ error: "Chatt hittades inte." });
    }

    const messages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, threadId))
      .orderBy(asc(aiMessages.createdAt));

    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ error: "Kunde inte hämta meddelanden." });
  }
});

router.post("/threads/:threadId/messages", async (req, res) => {
  try {
    console.log("POST /threads/:threadId/messages TRIGGERED");
    console.log("BODY:", req.body);
    console.log("THREAD ID:", req.params.threadId);

    const userId = await requireUser(req, res);
    if (!userId) return;

    const { threadId } = req.params;
    const { message } = req.body as { message?: string };

    if (!message?.trim()) {
      return res.status(400).json({ error: "Skriv något först." });
    }

    const cleanMessage = message.trim();

    const [thread] = await db
      .select()
      .from(aiThreads)
      .where(and(eq(aiThreads.id, threadId), eq(aiThreads.userId, userId)));

    if (!thread) {
      return res.status(404).json({ error: "Chatt hittades inte." });
    }

    await db.insert(aiMessages).values({
      threadId,
      role: "user",
      content: cleanMessage,
    });

    let newTitle = thread.title;

    if (thread.title === "Ny AI-chatt") {
      newTitle = cleanMessage.slice(0, 40);

      await db
        .update(aiThreads)
        .set({
          title: newTitle,
          updatedAt: new Date(),
        })
        .where(eq(aiThreads.id, threadId));
    } else {
      await db
        .update(aiThreads)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(aiThreads.id, threadId));
    }

    const messages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, threadId))
      .orderBy(asc(aiMessages.createdAt));

    const history = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let aiReply = "";

    try {
      aiReply = await callGemini(history);
    } catch (error) {
      console.error("GEMINI CALL ERROR:", error);

      aiReply =
        "Jag kunde inte svara just nu eftersom AI-tjänsten är tillfälligt otillgänglig. Försök igen om en stund.";
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
    });
  } catch (error) {
    console.error("AI MESSAGE ERROR FULL:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Kunde inte skicka meddelandet.";

    res.status(500).json({ error: message });
  }
});

export default router;
