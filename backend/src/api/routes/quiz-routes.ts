import { Router } from "express";
import { ZodError, ZodIssue, z } from "zod"; 
import { checkRole } from "./middlewares/role-middleware";
import { insertQuizSchema } from "../../db/validation";
import { quizService } from "../../services/quiz-service";
import { auth } from "../../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";

const router = Router();


/*CRUD quiz*/
//GET /:courseId/quiz - hämtar quiz som tillhör ett specifikt block
router.get("/:courseId/quiz", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid course ID" });
      return;
    }
    const getQuizFromCourse = await quizService.getQuizByCourseId(courseId);
    if (!getQuizFromCourse) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.status(200).json({
        message: "Quiz har hämtats",
        quizzes: getQuizFromCourse,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av quiz", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET /:courseId/quiz/:id - hämtar ett specifikt quiz
router.get("/:courseId/quiz/:id", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid quiz ID" });
      return;
    }
    const getQuizById = await quizService.getQuizById(id, Number(courseId));
    if (!getQuizById) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.status(200).json({
        message: "Quiz har hämtats",
        quiz: getQuizById,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av quiz", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST /:courseId/quiz - skapar quiz
router.post("/:courseId/quiz", checkRole(["admin", "creator"]), async (req, res) => {
    const courseId = req.params.courseId;

    try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    // Lägg till kontroll för session och userId
    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ error: "Unauthorized - User session not found" });
      return;
    }

    const validatedData = insertQuizSchema.parse(req.body);
    const createdBy = session.user.id;

    const newQuiz = await quizService.createQuiz({
        courseId: Number(courseId),
        createdBy,
        ...validatedData,
    })

    //Returnera svar med Express-syntax
    res.status(201).json({ 
        message: "Quizzet har skapats!", 
        quiz: newQuiz,
    });
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
    console.error("Fel vid skapande av quiz", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//PATCH /:courseId/quiz/:id - uppdaterar quiz
router.patch("/:courseId/quiz/:id", checkRole(["admin", "creator"]), async (req, res) => {
    const { id, courseId} = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const validatedData = insertQuizSchema.partial().parse(req.body);
        const updateOneQuiz = await quizService.updateQuiz(
          Number(id),
          Number(courseId),
          session.user.id,
          validatedData
        );

        if (!updateOneQuiz) {
            return res.status(404).json({
                error: "Quiz hittades inte"
            });
        }

        res.status(200).json({
            message: "Quiz har uppdaterats",
            quiz: updateOneQuiz,
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

        console.error("Fel vid uppdatering av quiz:", error);
        res.status(500).json({ error: "Kunde inte uppdatera quiz pga internt serverfel" });
    }
});

//DELETE /:courseId/quiz/:id - Tar bort quiz
router.delete("/:courseId/quiz/:id", checkRole(["admin", "creator"]),async (req, res) => {
    const { id, courseId } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const deleteOneQuiz = await quizService.deleteQuiz(
          Number(id),
          Number(courseId),
          session.user.id
        );
        res.status(200).json({
            message : "Quiz har tagits bort!", 
            quiz: deleteOneQuiz
        });
    } catch (error) {
        console.error("Fel vid borttagning av quiz:", error);
        res.status(500).json({ error: "Kunde inte ta bort quiz" });
    }
});

export default router;