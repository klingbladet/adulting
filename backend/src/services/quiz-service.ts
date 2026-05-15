import { db } from "../db";
import { quizzes } from "../db/schema";
import { insertQuizSchema } from "../db/validation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

type NewQuiz = z.infer<typeof insertQuizSchema>;

export const quizService = {
  async getQuizByCourseId(courseId: number) {

    return await db.select().from(quizzes).where(
      and(
        eq(quizzes.courseId, courseId)
      )
    )
  },

  async getQuizById(courseId: number, id: number) {

    return await db.select().from(quizzes).where(
      and(
        eq(quizzes.courseId, Number (courseId)),
        eq(quizzes.id, Number (id))
      )
    )
  },

  async createQuiz(data: NewQuiz & { courseId: number, createdBy: string }) {
    const newQuiz = await db.insert(quizzes).values(data).returning();
    return newQuiz[0];
  },

  async updateQuiz( id: number, courseId: number, createdBy: string, updates: Partial<NewQuiz> ) {
    const updateQuiz = await db.update(quizzes)
    .set(updates)
    .where( 
      and(
        eq(quizzes.id, id),
        eq(quizzes.courseId, courseId),
        eq(quizzes.createdBy, createdBy)
      ) 
    )
    .returning();

    return updateQuiz[0];
  },

  async deleteQuiz(id: number, courseId: number, createdBy: string) {
    const deleteQuiz = await db.delete(quizzes).where(
      and (
        eq(quizzes.id, id),
        eq(quizzes.courseId, courseId),
        eq(quizzes.createdBy, createdBy)
      )
    ).returning()
    return deleteQuiz[0];
  },
}