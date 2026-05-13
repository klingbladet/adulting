import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../db/auth-schema";
import { auth } from "../../utils/auth";

const router = Router();

function makeHeadersFromRequest(req: Request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(", "));
    else if (typeof value === "string") headers.set(key, value);
  }
  return headers;
}

async function requireUser(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: makeHeadersFromRequest(req),
  });
  const userId = session?.user?.id ?? null;
  if (!userId) {
    res.status(401).json({ error: "Du måste vara inloggad." });
    return null;
  }
  return userId;
}

router.get("/", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user);

    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ error: "Kunde inte hämta användare." });
  }
});

router.get("/creators", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const creators = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.role, "creator"));

    res.json(creators);
  } catch (error) {
    console.error("GET CREATORS ERROR:", error);
    res.status(500).json({ error: "Kunde inte hämta creators." });
  }
});

export default router;