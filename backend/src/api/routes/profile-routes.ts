import { Router, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";

import { auth } from "../../utils/auth";
import { db } from "../../db";
import { user } from "../../db/auth-schema";

const router = Router();

async function requireSession(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    res.status(401).json({
      error: "Du måste vara inloggad.",
    });

    return null;
  }

  return session;
}

router.get("/me", async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;

    const [currentUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return res.status(404).json({
        error: "Användaren hittades inte.",
      });
    }

    return res.json({
      user: currentUser,
      stats: {
        startedCourses: 0,
        completedCourses: 0,
      },
      courses: [],
      badges: [],
    });
  } catch (error) {
    console.error("GET PROFILE ME ERROR:", error);

    return res.status(500).json({
      error: "Kunde inte hämta profil.",
    });
  }
});

export default router;