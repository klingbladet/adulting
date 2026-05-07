import { Router, Request, Response } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { aiMessages, aiThreads } from "../../db/schema";
import { auth } from "../../utils/auth";
import { SYSTEM_PROMPT } from "../../utils/ai-prompt";

const router = Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ||
  "meta-llama/llama-3.1-8b-instruct:free";


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

async function callOpenRouter(
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>
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
            content: SYSTEM_PROMPT,
          },
          ...history,
        ],
        temperature: 0.7,
        max_tokens: 700,
      }),
    }
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
      data?.error?.message || "OpenRouter kunde inte svara"
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
          eq(aiThreads.userId, userId)
        )
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
          eq(aiThreads.userId, userId)
        )
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


router.post("/threads/:threadId/messages", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const { threadId } = req.params;
    const { message } = req.body;

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
          eq(aiThreads.userId, userId)
        )
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

    let aiReply = "";

    try {
      aiReply = await callOpenRouter(history);
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
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Kunde inte skicka meddelande",
    });
  }
});

export default router;