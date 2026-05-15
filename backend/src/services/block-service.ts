import { db } from "../db";
import { blocks } from "../db/schema";
import { insertBlockSchema } from "../db/validation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

type NewBlock = z.infer<typeof insertBlockSchema>;

export const blockService = {
  async saveBlocks(courseId: number, userId: string, blocksData: any[]) {
    return await db.transaction(async (tx) => {
      await tx.delete(blocks).where(
        and(
          eq(blocks.courseId, courseId),
          eq(blocks.userId, userId)
        )
      );
      const formattedBlocks = blocksData.map((b, index) => ({
        courseId: courseId,
        userId: userId,
        orderIndex: index,
        title: b.ttle || `Block ${index + 1}`,
        content: b.content,
      }));
    })
  },

  async getAllBlocks(courseId: number) {

    return await db.select().from(blocks).where(
      and(
        eq(blocks.courseId, Number (courseId))
      )
    )
  },

  async getOneBlock(blockId: number, courseId: number) {

    return await db.select().from(blocks).where(
      and(
        eq(blocks.id, Number (blockId)),
        eq(blocks.courseId, Number (courseId))
      )
    )
  },

  async createBlock(data: NewBlock & { courseId: number, userId: string }) {
    const newBlock = await db.insert(blocks).values(data).returning();
    return newBlock[0];
  },

  async updateBlock( blockId: number, courseId: number, userId: string, updates: Partial<NewBlock> ) {
    const updateBlock = await db.update(blocks)
    .set(updates)
    .where( 
      and(
        eq(blocks.id, blockId),
        eq(blocks.courseId, courseId),
        eq(blocks.userId, userId)
      ) 
    )
    .returning();

    return updateBlock[0];
  },

  async deleteBlock(id: number, courseId: number, userId: string) {
    const deleteBlock = await db.delete(blocks).where(
      and (
        eq(blocks.id, id),
        eq(blocks.courseId, courseId),
        eq(blocks.userId, userId)
      )
    ).returning()
    return deleteBlock[0];
  },
}