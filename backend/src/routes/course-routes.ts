import { Router } from "express";
import { ZodError, ZodIssue } from "zod"; 
import { checkRole } from "../api/routes/middlewares/role-middleware"
import { insertCourseSchema } from "../db/validation";
import { courseService } from "../services/course-service";
import { auth } from "../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allCourses = await courseService.getAllCourses();
    res.json(allCourses) 
  } catch (error) {
    console.error("Fel vid hämtningen av kurser", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", checkRole(["admin", "creator"]), async (req, res) => {
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

export default router;