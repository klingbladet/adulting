import { Router } from "express";
import { db } from "../../db";
import { courses } from "../../db/course-schema";
import { insertCourseSchema } from "../../db/validation";
import { ZodError } from "zod";
import { checkRole } from "./middlewares/role-middleware";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allCourses = await db.select().from (courses);
    res.json(allCourses);
  } catch (error) {
    console.error("Fel vid hämtningen av kurser, error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", checkRole(["admin", "creator"]), async (req, res) => {
  try {
    const validatedData = insertCourseSchema.parse(req.body);

    // Returnera svar med Express-syntax
    const newCourse = await db.insert(courses).values(validatedData).returning();

    //Returnera svar med Express-syntax
    res.status(201).json(newCourse[0]);
  } catch (error) {
    if(error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors.map(e => ({
          path: e.path,
          message: e.message 
        }))
      }); 
      return;
    }
    console.log("Fel vid skapande av kurs", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Lägg till fler routes här:

export default router;