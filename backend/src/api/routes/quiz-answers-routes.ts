import { Router } from "express";
import { ZodError, ZodIssue } from "zod"; 
import { insertQuizAnswersSchema } from "../../db/validation";
import { quizAnswersService } from "../../services/quiz-answers-service";

const router = Router();

/*CRUD quiz-answers*/
//GET /:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers - hämtar svar från ett specifikt attempt
router.get("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers", async (req, res) => {
  try {
    const { attemptId, questionId, quizId, courseId, blockId } = req.params;

    const getQuizAnswersByAttemptId = await quizAnswersService.getQuizAnswersByAttemptId( String(attemptId), Number(questionId), Number(courseId), Number(blockId), Number(quizId));
    if (!getQuizAnswersByAttemptId) {
      res.status(404).json({ error: "Answers not found" });
      return;
    }
    res.status(200).json({
        message: "Svar har hämtats",
        answers: getQuizAnswersByAttemptId,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av svar", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET /:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers/:id - hämtar specifikt svar från specifikt attempt
router.get("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers/:id", async (req, res) => {
  try {
    const { id, attemptId, questionId, quizId, courseId, blockId } = req.params;

    const getAttemptAnswerById = await quizAnswersService.getQuizAnswerById(String(id), String(attemptId), Number(questionId),Number(blockId), Number(courseId), Number(quizId));
    if (!getAttemptAnswerById) {
      res.status(404).json({ error: "Answer not found" });
      return;
    }
    res.status(200).json({
        message: "Svar har hämtats",
        answer: getAttemptAnswerById,
    });
  } catch (error) {
    console.error("Fel vid hämtningen av svar", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST /:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers - skapar svar i ett attempt
router.post("/:courseId/quizzes/:quizId/blocks/:blockId/questions/:questionId/attempts/:attemptId/answers", async (req, res) => {
    const { attemptId, questionId, quizId, courseId, blockId } = req.params;
  
    try {
    const validatedData = insertQuizAnswersSchema.parse(req.body);

    const newQuizQuestion = await quizAnswersService.createQuizAnswer({
        attemptId: String(attemptId),
        questionId: Number(questionId),
        blockId: Number(blockId),
        courseId: Number(courseId),
        quizId: Number(quizId),
        ...validatedData
    })

    //Returnera svar med Express-syntax
    res.status(201).json({ 
        message: "Svar har registrerats!", 
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
    console.error("Fel vid registrering av svar", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;