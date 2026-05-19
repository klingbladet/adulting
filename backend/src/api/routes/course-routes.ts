import { Router } from "express";
import { ZodError, ZodIssue, z } from "zod"; 
import { checkRole } from "./middlewares/role-middleware";
import { insertCourseSchema } from "../../db/validation";
import { courseService } from "../../services/course-service";
import { auth } from "../../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";
import { db } from "../../db";
import { userCourses, categories } from "../../db/course-schema";
import { eq, and } from "drizzle-orm";

const router = Router();

const enrollSchema = z.object({
  knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

router.get("/categories", async (req, res) => { 
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

router.get("", async (req, res) => {
  try {
    const categoryName = req.query.category as string | undefined;
    const allCourses = await courseService.getAllCourses(categoryName);
    res.json(allCourses) 
  } catch (error) {
    console.error("Fel vid hämtningen av kurser", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid course ID" });
      return;
    }
    const course = await courseService.getCourseById(id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(course);
  } catch (error) {
    console.error("Fel vid hämtningen av kurs", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("", checkRole(["admin", "creator"]), async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    // Lägg till kontroll för session och userId
    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ error: "Unauthorized - User session not found" });
      return;
    }

    const validatedData = insertCourseSchema.parse(req.body);

    // Returnera svar med Express-syntax
    const newCourse = await courseService.createCourse({
      ...validatedData, 
      userId: session.user.id // Använd session.user.id direkt
    })

    //Returnera svar med Express-syntax
    res.status(201).json(newCourse);
  } catch (error) {
    if(error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((e: ZodIssue) => ({ // Ändrade från errors till issues
          path: e.path,
          message: e.message 
        }))
      }); 
      return;
    }
    console.error("Fel vid skapande av kurs", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/courses/:courseId/enroll
// Skapar eller uppdaterar en userCourses-rad med knowledgeLevel
router.post("/:courseId/enroll", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      res.status(401).json({ error: "Du måste vara inloggad." });
      return;
    }

    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Ogiltigt kurs-ID." });
      return;
    }

    const { knowledgeLevel } = enrollSchema.parse(req.body ?? {});
    const userId = session.user.id;

    // Kolla om användaren redan är inskriven
    const [existing] = await db
      .select()
      .from(userCourses)
      .where(and(eq(userCourses.userId, userId), eq(userCourses.courseId, courseId)));

    if (existing) {
      // Uppdatera knowledgeLevel
      const [updated] = await db
        .update(userCourses)
        .set({ knowledgeLevel: knowledgeLevel ?? null })
        .where(and(eq(userCourses.userId, userId), eq(userCourses.courseId, courseId)))
        .returning();
      res.status(200).json({ message: "Kursregistrering uppdaterad.", userCourse: updated });
    } else {
      // Skapa ny rad
      const [created] = await db
        .insert(userCourses)
        .values({
          userId,
          courseId,
          status: "not_started",
          enrolledAt: new Date(),
          knowledgeLevel: knowledgeLevel ?? null,
        })
        .returning();
      res.status(201).json({ message: "Inskriven i kursen.", userCourse: created });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((e: ZodIssue) => ({ path: e.path, message: e.message })),
      });
      return;
    }
    console.error("Fel vid inskrivning i kurs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//PATCH /:id - uppdaterar course
router.patch("/:id", checkRole(["admin", "creator"]), async (req, res) => {
    const { id } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const validatedData = insertCourseSchema.partial().parse(req.body);
        const updateOneCourse = await courseService.updateCourse(
          Number(id),
          session.user.id,
          validatedData
        );

        if (!updateOneCourse) {
            return res.status(404).json({
                error: "Course hittades inte"
            });
        }

        res.status(200).json({
            message: "Course har uppdaterats",
            course: updateOneCourse,
        });

    } catch (error) {
        if(error instanceof ZodError) {
          return res.status(400).json({
            error: "Validation failed",
            details: error.issues.map((e: ZodIssue) => ({ // Ändrade från errors till issues
              path: e.path,
              message: e.message 
            }))
          });
        }

        console.error("Fel vid uppdatering av course:", error);
        res.status(500).json({ error: "Kunde inte uppdatera course pga internt serverfel" });
    }
});

//DELETE /:id - Tar bort course
router.delete("/:id", checkRole(["admin", "creator"]),async (req, res) => {
    const { id } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const deleteOneCourse = await courseService.deleteCourse(
          Number(id),
          session.user.id
        );
        res.status(200).json({message : "Course har tagits bort!", course: deleteOneCourse});
    } catch (error) {
        console.error("Fel vid borttagning av course:", error);
        res.status(500).json({ error: "Kunde inte ta bort course" });
    }
});

export default router;
