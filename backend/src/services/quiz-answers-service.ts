import { db } from "../db";
import { quizAnswers } from "../db/schema";
import { insertQuizAnswersSchema } from "../db/validation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

type NewQuizAnswer = z.infer<typeof insertQuizAnswersSchema>;

export const quizAnswersService = {
  async getQuizAnswersByAttemptId(attemptId: string, questionId: number, quizId: number, courseId: number, blockId: number) {

    return await db.select().from(quizAnswers).where(
      and(
        eq(quizAnswers.attemptId, String(attemptId)),
        eq(quizAnswers.questionId, Number(questionId)), 
        eq(quizAnswers.quizId, Number(quizId)), 
        eq(quizAnswers.courseId, Number(courseId)), 
        eq(quizAnswers.blockId, Number(blockId))  //Lägg ain andra parametrar som kan behövas?
      )
    )
  },

  async getQuizAnswerById(id: string, attemptId: string, questionId: number, quizId: number, courseId: number, blockId: number) {
    return await db.select().from(quizAnswers).where(
      and(
        eq(quizAnswers.id, String(id)),
        eq(quizAnswers.attemptId, String(attemptId)),
        eq(quizAnswers.questionId, Number(questionId)), 
        eq(quizAnswers.quizId, Number(quizId)), 
        eq(quizAnswers.courseId, Number(courseId)), 
        eq(quizAnswers.blockId, Number(blockId))
      )
    )
  },

  async createQuizAnswer(data: NewQuizAnswer & { attemptId: string, questionId: number, quizId: number, courseId: number, blockId: number }) {
    const newQuizQuestions = await db.insert(quizAnswers).values(data).returning();
    return newQuizQuestions[0];
  }
}