import { db } from "../db";
import { quizzes } from "../db/schema";
import { insertQuizSchema } from "../db/validation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

type NewQuiz = z.infer<typeof insertQuizSchema>;

export const quizService = {
  async getQuizByBlockId(blockId: number) {

    return await db.select().from(quizzes).where(
      and(
        eq(quizzes.blockId, Number (blockId))
      )
    )
  },

  async getQuizById(id: number) {

    return await db.select().from(quizzes).where(
      and(
        eq(quizzes.id, Number (id))
      )
    )
  },

  async createQuiz(data: NewQuiz & { blockId: number, userId: string }) {
    const newQuiz = await db.insert(quizzes).values(data).returning();
    return newQuiz[0];
  },

  async updateQuiz( id: number, blockId: number, userId: string, updates: Partial<NewQuiz> ) {
    const updateBlock = await db.update(quizzes)
    .set(updates)
    .where( 
      and(
        eq(quizzes.id, id),
        eq(quizzes.blockId, blockId),
        eq(quizzes.userId, userId)
      ) 
    )
    .returning();

    return updateBlock[0];
  },

  async deleteQuiz(id: number, blockId: number, userId: string) {
    const deleteQuiz = await db.delete(quizzes).where(
      and (
        eq(quizzes.id, id),
        eq(quizzes.blockId, blockId),
        eq(quizzes.userId, userId)
      )
    ).returning()
    return deleteQuiz[0];
  },
}