import { asc, desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { quizQuestions, quizzes } from "../../db/schema";
import type { GeneratedQuiz } from "./types";

type SaveQuizDraftInput = {
  courseId: string;
  quiz: GeneratedQuiz;
  difficulty: "easy" | "medium" | "hard";
  createdBy?: string | null;
};

export async function saveGeneratedQuizAsDraft(input: SaveQuizDraftInput) {
  const courseId = Number(input.courseId);

  if (!Number.isInteger(courseId)) {
    throw new Error(`Ogiltigt courseId: ${input.courseId}`);
  }

  return db.transaction(async (tx) => {
    const [createdQuiz] = await tx
      .insert(quizzes)
      .values({
        courseId,
        createdBy: input.createdBy ?? null,
        title: input.quiz.title,
        description: `AI-genererat quiz för kurs ${courseId}`,
        type: "diagnostic",
        status: "draft",
        generatedByAi: true,
      })
      .returning();

    if (!createdQuiz) {
      throw new Error("Kunde inte skapa quiz draft.");
    }

    const questionsToInsert = input.quiz.questions.map((question, index) => {
      const blockId = Number(question.blockId);

      if (!Number.isInteger(blockId)) {
        throw new Error(`Ogiltigt blockId: ${question.blockId}`);
      }

      return {
        quizId: createdQuiz.id,
        blockId,
        courseId,
        createdBy: input.createdBy ?? null,
        question: question.question,
        options: question.options,
        correctOptionId: question.correctOptionId,
        difficulty: input.difficulty,
        orderIndex: index,
      };
    });

    const createdQuestions = await tx
      .insert(quizQuestions)
      .values(questionsToInsert)
      .returning();

    return {
      quiz: createdQuiz,
      questions: createdQuestions,
    };
  });
}

export async function getLatestQuizDraftForCourse(courseIdInput: string) {
  const courseId = Number(courseIdInput);

  if (!Number.isInteger(courseId)) {
    throw new Error(`Ogiltigt courseId: ${courseIdInput}`);
  }

  const [draftQuiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.courseId, courseId))
    .orderBy(desc(quizzes.id))
    .limit(1);

  if (!draftQuiz) {
    return null;
  }

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, draftQuiz.id))
    .orderBy(asc(quizQuestions.orderIndex));

  return {
    quiz: draftQuiz,
    questions,
  };
}