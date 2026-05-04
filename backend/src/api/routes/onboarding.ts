import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { fromNodeHeaders } from "better-auth/node";

import { db } from "../../db";
import { user } from "../../db/auth-schema";
import { auth } from "../../utils/auth";
import {
  getPostAuthRedirectPath,
  isOnboardingStatus,
  OnboardingStatus,
} from "../../utils/onboarding";



const router = Router();

async function requireUser(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const userId = session?.user?.id ?? null;

  if (!userId) {
    res.status(401).json({ error: "Du måste vara inloggad." });
    return null;
  }

  return userId;
}

router.get("/status", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const [currentUser] = await db
      .select({
        id: user.id,
        onboardingStatus: user.onboardingStatus,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!currentUser) {
      return res.status(404).json({ error: "Användaren hittades inte." });
    }

const status: OnboardingStatus = isOnboardingStatus(currentUser.onboardingStatus)
  ? currentUser.onboardingStatus
  : "not_started";
  
    return res.json({
      onboardingStatus: status,
      redirectTo: getPostAuthRedirectPath(status),
    });
  } catch (error) {
    console.error("GET ONBOARDING STATUS ERROR:", error);
    return res.status(500).json({
      error: "Kunde inte hämta onboarding-status.",
    });
  }
});

router.patch("/status", async (req, res) => {
  try {
    const userId = await requireUser(req, res);
    if (!userId) return;

    const { status } = req.body;

    if (!isOnboardingStatus(status)) {
      return res.status(400).json({
        error: "Ogiltig onboarding-status.",
      });
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        onboardingStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        onboardingStatus: user.onboardingStatus,
      });

    const updatedStatus: OnboardingStatus = isOnboardingStatus(
      updatedUser.onboardingStatus
    )
      ? updatedUser.onboardingStatus
      : "not_started";

    return res.json({
      onboardingStatus: updatedStatus,
      redirectTo: getPostAuthRedirectPath(updatedStatus),
    });
  } catch (error) {
    console.error("PATCH ONBOARDING STATUS ERROR:", error);
    return res.status(500).json({
      error: "Kunde inte uppdatera onboarding-status.",
    });
  }
});

export default router;