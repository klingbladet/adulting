import { db } from "../db";
import { quizQuestions } from "../db/schema";
import { insertQuizQuestionsSchema } from "../db/validation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

type NewQuizQuestion = z.infer<typeof insertQuizQuestionsSchema>;

export const quizQuestionsService = {
  async getQuizQuestionsByQuizId(blockId: number, courseId: number, quizId: number) {

    return await db.select().from(quizQuestions).where(
      and(
        eq(quizQuestions.quizId, Number(quizId)),
        eq(quizQuestions.blockId, Number(blockId)),
        eq(quizQuestions.courseId, Number(courseId))
      )
    )
  },

  async getQuizQuestionById(id: number, blockId: number, courseId: number, quizId: number) {

    return await db.select().from(quizQuestions).where(
      and(
        eq(quizQuestions.id, Number (id)),
        eq(quizQuestions.quizId, Number(quizId)),
        eq(quizQuestions.blockId, Number(blockId)),
        eq(quizQuestions.courseId, Number(courseId))
      )
    )
  },

  async createQuizQuestion(data: NewQuizQuestion & { quizId: number, blockId: number, courseId: number, createdBy: string }) {
    const newQuizQuestions = await db.insert(quizQuestions).values(data).returning();
    return newQuizQuestions[0];
  },

  async updateQuizQuestion( id: number, quizId: number, blockId: number, courseId: number, createdBy: string, updates: Partial<NewQuizQuestion> ) {
    const updateQuizQuestion = await db.update(quizQuestions)
    .set(updates)
    .where( 
      and(
        eq(quizQuestions.id, id),
        eq(quizQuestions.quizId, quizId),
        eq(quizQuestions.blockId, blockId),
        eq(quizQuestions.courseId, courseId),
        eq(quizQuestions.createdBy, createdBy)
      ) 
    )
    .returning();

    return updateQuizQuestion[0];
  },

  async deleteQuizQuestion(id: number, quizId: number, blockId: number, courseId: number, createdBy: string) {
    const deleteQuizQuestion = await db.delete(quizQuestions).where(
      and (
        eq(quizQuestions.id, id),
        eq(quizQuestions.quizId, quizId),
        eq(quizQuestions.blockId, blockId),
        eq(quizQuestions.courseId, courseId),
        eq(quizQuestions.createdBy, createdBy)
      )
    ).returning()
    return deleteQuizQuestion[0];
  },
}