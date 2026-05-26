import { db } from "../db";
import { blocks } from "../db/schema";
import { insertBlockSchema } from "../db/validation";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";

type NewBlock = z.infer<typeof insertBlockSchema>;

export const blockService = {
  async saveBlocks(courseId: number, userId: string, blocksData: any[]) {
    return await db.transaction(async (tx) => {
      // 1. Hämta befintliga block för att veta vilka som ska tas bort
      const existingBlocks = await tx.select().from(blocks).where(
        and(
          eq(blocks.courseId, courseId),
          eq(blocks.userId, userId)
        )
      );

      const existingIds = existingBlocks.map(b => b.id);
      const incomingIds = blocksData.filter(b => b.id).map(b => b.id);
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

      // 2. Ta bort endast de block som raderats i frontend
      if (idsToDelete.length > 0) {
        await tx.delete(blocks).where(inArray(blocks.id, idsToDelete));
      }

      // 3. Upsert: Uppdatera befintliga eller Skapa nya
      const savedBlocks = [];
      for (const [index, b] of blocksData.entries()) {
        
        // Vi plockar ut ID separat för att inte skriva över primärnyckeln i onödan,
        // men sparar allt annat (som 'type') i variabeln 'rest'
        const { id, ...rest } = b;

        const blockData = {
          ...rest,
          courseId: courseId,
          userId: userId,
          orderIndex: index, 
          title: b.title || `Block ${index + 1}`,
          // Säkerställer att content blir en sträng om Tiptap skickar ett objekt
          content: typeof b.content === 'object' ? JSON.stringify(b.content) : b.content,
        };

        if (id) {
          // Block finns, uppdatera det!
          const [updated] = await tx.update(blocks).set(blockData).where(eq(blocks.id, id)).returning();
          savedBlocks.push(updated);
        } else {
          // Nytt block från textredigeraren, skapa det!
          const [inserted] = await tx.insert(blocks).values(blockData).returning();
          savedBlocks.push(inserted);
        }
      }

      // Returnerar de sparade blocken (med sina riktiga ID:n) tillbaka till routen
      return savedBlocks;
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