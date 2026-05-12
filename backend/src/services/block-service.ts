import { db } from "../db";
import { blocks } from "../db/schema";
import { insertBlockSchema } from "../db/validation";
import { set, z } from "zod";
import { and, eq } from "drizzle-orm";

type NewBlock = z.infer<typeof insertBlockSchema>;

export const blockService = {
  async getAllBlocks(courseId: number) {

    return await db.select().from(blocks).where(
      and(
        eq(blocks.courseId, Number (courseId))
      )
    )
  },

  async createBlock(data: NewBlock & { courseId: number }) {
    const newBlock = await db.insert(blocks).values(data).returning();
    return newBlock[0];
  },

  async updateBlock( blockId: number, courseId: number, updates: Partial<NewBlock> ) {
    const updateBlock = await db.update(blocks)
    .set(updates)
    .where( 
      and(
        eq(blocks.id, blockId),
        eq(blocks.courseId, courseId)
      ) 
    )
    .returning();

    return updateBlock[0];
  },

  async deleteBlock(id: number, courseId: number) {
    const deleteBlock = await db.delete(blocks).where(
      and (
        eq(blocks.id, id),
        eq(blocks.courseId, courseId)
      )
    ).returning()
    return deleteBlock[0];
  },
}