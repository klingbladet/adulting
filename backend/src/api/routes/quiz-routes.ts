import { Router } from "express";
import { ZodError, ZodIssue, z } from "zod"; 
import { checkRole } from "./middlewares/role-middleware";
import { insertQuizSchema } from "../../db/validation";
import { quizService } from "../../services/quiz-service";
import { auth } from "../../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";
//import { userCourses } from "../../db/course-schema";

const router = Router();


/*CRUD quiz*/
//GET /:courseId/blocks/:blockId/quiz - hämtar quiz som tillhör ett specifikt block
router.get("/:courseId/blocks/:blockId/quiz", async (req, res) => {
  try {
    const blockId = parseInt(req.params.blockId);
    if (isNaN(blockId)) {
      res.status(400).json({ error: "Invalid block ID" });
      return;
    }
    const getQuizFromBlock = await quizService.getQuizByBlockId(blockId);
    if (!getQuizFromBlock) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.status(200).json({
        message: "Quiz har hämtats",
        quiz: getQuizFromBlock,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av quiz", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET /:courseId/blocks/:blockId/quiz/:id - hämtar ett specifikt quiz
router.get("/:courseId/blocks/:blockId/quiz/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid quiz ID" });
      return;
    }
    const getQuizById = await quizService.getQuizById(id);
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

//POST /:courseId/blocks/:blockId/quiz - skapar quiz
router.post("/:courseId/blocks/:blockId/quiz", checkRole(["admin", "creator"]), async (req, res) => {
    const  blockId = req.params.blockId;

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
    const userId = session.user.id;

    const newQuiz = await quizService.createQuiz({
        blockId: Number(blockId),
        userId,
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

//PATCH /:courseId/blocks/:blockId/quiz/:id - uppdaterar quiz
router.patch("/:courseId/blocks/:blockId/quiz/:id", checkRole(["admin", "creator"]), async (req, res) => {
    const { id, blockId } = req.params;

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
          Number(blockId),
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

//DELETE /:courseId/blocks/:blockId/quiz/:id - Tar bort quiz
router.delete("/:courseId/blocks/:blockId/quiz/:id", checkRole(["admin", "creator"]),async (req, res) => {
    const { id, blockId } = req.params;

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
          Number(blockId),
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