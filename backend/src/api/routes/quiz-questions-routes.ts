import { Router } from "express";
import { ZodError, ZodIssue, z } from "zod"; 
import { checkRole } from "./middlewares/role-middleware";
import { insertQuizQuestionsSchema } from "../../db/validation";
import { quizQuestionsService } from "../../services/quiz-questions-service";
import { auth } from "../../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";

const router = Router();


/*CRUD quiz-questions*/
//GET /:courseId/quizzes/:quizId/blocks/:blockId/questions - hämtar frågor till ett specifikt quiz
router.get("/:courseId/quizzes/:quizId/blocks/:blockId/questions", async (req, res) => {
  try {
    const { blockId, courseId } = req.params;
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) {
      res.status(400).json({ error: "Invalid quiz ID" });
      return;
    }
    const getQuizQuestionsFromQuiz = await quizQuestionsService.getQuizQuestionsByQuizId(Number(courseId), Number(blockId), quizId);
    if (!getQuizQuestionsFromQuiz) {
      res.status(404).json({ error: "Questions not found" });
      return;
    }
    res.status(200).json({
        message: "Frågor har hämtats",
        questions: getQuizQuestionsFromQuiz,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av frågor", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET /:courseId/quizzes/:quizId/blocks/:blockId/questions/:id - hämtar specifik fråga
router.get("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:id", async (req, res) => {
  try {
    const { blockId, courseId, quizId } = req.params;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid quiz ID" });
      return;
    }
    const getQuizQuestionById = await quizQuestionsService.getQuizQuestionById(id, Number(blockId), Number(courseId), Number(quizId));
    if (!getQuizQuestionById) {
      res.status(404).json({ error: "Questions not found" });
      return;
    }
    res.status(200).json({
        message: "Frågorna har hämtats",
        question: getQuizQuestionById,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av frågor", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST /:courseId/quizzes/:quizId/blocks/:blockId/questions - skapar fråga
router.post("/:courseId/quizzes/:quizId/blocks/:blockId/questions", checkRole(["admin", "creator"]), async (req, res) => {
    const { blockId, courseId, quizId } = req.params;

    try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    // Lägg till kontroll för session och userId
    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ error: "Unauthorized - User session not found" });
      return;
    }

    const validatedData = insertQuizQuestionsSchema.parse(req.body);
    const createdBy = session.user.id;

    const newQuizQuestion = await quizQuestionsService.createQuizQuestion({
        blockId: Number(blockId),
        courseId: Number(courseId),
        quizId: Number(quizId),
        createdBy,
        ...validatedData,
    })

    //Returnera svar med Express-syntax
    res.status(201).json({ 
        message: "Fråga har skapats!", 
        questions: newQuizQuestion,
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
    console.error("Fel vid skapande av fråga", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//PATCH /:courseId/quizzes/:quizId/blocks/:blockId/questions/:id - uppdaterar quiz
router.patch("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:id", checkRole(["admin", "creator"]), async (req, res) => {
    const { id, blockId, courseId, quizId } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const validatedData = insertQuizQuestionsSchema.partial().parse(req.body);
        const updateOneQuizQuestion = await quizQuestionsService.updateQuizQuestion(
          Number(id),
          Number(blockId),
          Number(courseId),
          Number(quizId),
          session.user.id,
          validatedData
        );

        if (!updateOneQuizQuestion) {
            return res.status(404).json({
                error: "Fråga hittades inte"
            });
        }

        res.status(200).json({
            message: "Fråga har uppdaterats",
            question: updateOneQuizQuestion,
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

        console.error("Fel vid uppdatering av fråga:", error);
        res.status(500).json({ error: "Kunde inte uppdatera fråga pga internt serverfel" });
    }
});

//DELETE /:courseId/quizzes/:quizId/blocks/:blockId/questions/:id - Tar bort quiz
router.delete("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:id", checkRole(["admin", "creator"]),async (req, res) => {
    const { id, blockId, courseId, quizId } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const deleteOneQuizQuestion = await quizQuestionsService.deleteQuizQuestion(
          Number(id),
          Number(blockId),
          Number(courseId),
          Number(quizId),
          session.user.id,
        );
        res.status(200).json({
            message : "Fråga har tagits bort!", 
            question: deleteOneQuizQuestion
        });
    } catch (error) {
        console.error("Fel vid borttagning av fråga:", error);
        res.status(500).json({ error: "Kunde inte ta bort fråga" });
    }
});

export default router;