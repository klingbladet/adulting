import { Router, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";

import { auth } from "../../utils/auth";
import { db } from "../../db";
import { user, session, account, userOnboarding } from "../../db/auth-schema";
import { courses, userCourses } from "../../db/course-schema";

const router = Router();

async function requireSession(req: Request, res: Response) {
  const currentSession = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!currentSession?.user?.id) {
    res.status(401).json({ error: "Du måste vara inloggad." });
    return null;
  }

  return currentSession;
}

function getCourseImage(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("jobb")) return "/images/icons/jobb.jpg";
  if (lower.includes("körkort")) return "/images/icons/korkort.jpg";
  if (lower.includes("ekonomi")) return "/images/icons/ekonomi.jpg";
  if (lower.includes("boende")) return "/images/icons/bostad.jpg";
  if (lower.includes("utbild")) return "/images/icons/utbildning.jpg";
  if (lower.includes("skatt")) return "/images/icons/skatt.png";
  if (lower.includes("csn")) return "/images/icons/CSN.png";

  return "/images/icons/bostad.jpg";
}

function getProgress(status: string, score: number | null) {
  if (status === "completed") return 100;
  if (typeof score === "number") return Math.min(Math.max(score, 0), 100);
  return 0;
}

router.get("/me", async (req, res) => {
  try {
    const currentSession = await requireSession(req, res);
    if (!currentSession) return;

    const userId = currentSession.user.id;

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
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser) {
      return res.status(404).json({ error: "Användaren hittades inte." });
    }

    const userCourseRows = await db
      .select({
        id: userCourses.id,
        courseId: courses.id,
        title: courses.title,
        status: userCourses.status,
        score: userCourses.score,
        totalSteps: courses.blocks,
        isPublished: courses.isPublished,
      })
      .from(userCourses)
      .innerJoin(courses, eq(userCourses.courseId, courses.id))
      .where(eq(userCourses.userId, userId));

    const profileCourses = userCourseRows
      .filter((item) => item.isPublished)
      .map((item) => {
        const progress = getProgress(item.status, item.score);
        const totalSteps = Math.max(item.totalSteps ?? 0, 1);
        const completedSteps = Math.round((progress / 100) * totalSteps);

        return {
          id: String(item.courseId),
          title: item.title,
          status: item.status,
          progress,
          totalSteps,
          completedSteps,
          image: getCourseImage(item.title),
        };
      });

    return res.json({
      user: currentUser,
      settings: {
        language: "sv",
        notifications: {
          push: true,
          email: false,
          progress: true,
        },
      },
      stats: {
        startedCourses: profileCourses.filter(
          (course) => course.status === "in_progress"
        ).length,
        completedCourses: profileCourses.filter(
          (course) => course.status === "completed"
        ).length,
      },
      courses: profileCourses,
      badges: [],
    });
  } catch (error) {
    console.error("GET PROFILE ME ERROR:", error);
    return res.status(500).json({ error: "Kunde inte hämta profil." });
  }
});

router.patch("/me", async (req, res) => {
  try {
    const currentSession = await requireSession(req, res);
    if (!currentSession) return;

    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (name.length < 2) {
      return res.status(400).json({
        error: "Namnet måste vara minst 2 tecken.",
      });
    }

    const [updatedUser] = await db
      .update(user)
      .set({ name, updatedAt: new Date() })
      .where(eq(user.id, currentSession.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
      });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH PROFILE ME ERROR:", error);
    return res.status(500).json({ error: "Kunde inte uppdatera profil." });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const currentSession = await requireSession(req, res);
    if (!currentSession) return;

    return res.json({
      ok: true,
      settings: {
        language: req.body?.language ?? "sv",
        birthdate: req.body?.birthdate ?? null,
        notifications: req.body?.notifications ?? {
          push: true,
          email: false,
          progress: true,
        },
      },
    });
  } catch (error) {
    console.error("PATCH PROFILE SETTINGS ERROR:", error);
    return res.status(500).json({ error: "Kunde inte spara inställningar." });
  }
});

router.delete("/me", async (req, res) => {
  try {
    const currentSession = await requireSession(req, res);
    if (!currentSession) return;

    const userId = currentSession.user.id;

    await db.delete(userCourses).where(eq(userCourses.userId, userId));
    await db.delete(userOnboarding).where(eq(userOnboarding.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(session).where(eq(session.userId, userId));
    await db.delete(user).where(eq(user.id, userId));

    return res.json({ ok: true, message: "Kontot har raderat." });
  } catch (error) {
    console.error("DELETE PROFILE ME ERROR:", error);
    return res.status(500).json({ error: "Kunde inte radera konto." });
  }
});

export default router;