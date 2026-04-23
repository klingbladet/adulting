import { Router } from "express";
import { ZodError } from "zod";
import { checkRole } from "./middlewares/role-middleware";
import { insertCourseSchema } from "../../db/validation";
import { courseService } from "../../services/course-service";

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
    const validatedData = insertCourseSchema.parse(req.body);

    // Returnera svar med Express-syntax
    const newCourse = await courseService.createCourse(validatedData)

    //Returnera svar med Express-syntax
    res.status(201).json(newCourse);
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
    console.error("Fel vid skapande av kurs", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;