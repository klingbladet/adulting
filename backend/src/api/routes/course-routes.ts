import { Router } from "express";
import { db } from "../../db";
import { courses } from "../../db/course-schema";
import { insertCourseSchema } from "../../db/validation";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedData = insertCourseSchema.parse(req.body);

    // Returnera svar med Express-syntax
    const newCourse = await db.insert(courses).values(validatedData).returning();

    //Returnera svar med Express-syntax
    res.status(201).json(newCourse[0]);
  } catch (error) {
    // Logga felet för debugging
    console.error("Fel vid skapande av kurs", error);
    res.status(400).json({ error: "Validation failed",
      details: error });
  }
})

// Lägg till fler routes här:

export default router;