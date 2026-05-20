import { db } from "../db";
import { courses } from "../db/schema";
import { insertCourseSchema } from "../db/validation";
import { z } from "zod";
import { categories } from "../db/schema";
import { eq, and, ilike } from "drizzle-orm";

type NewCourse = z.infer<typeof insertCourseSchema>;

export const courseService = {
  async getAllCourses(categoryName?: string) {
    if (categoryName) {
      // Steg 1: hitta kategorin via namn (case-insensitive)
      const category = await db.query.categories.findFirst({
        where: ilike(categories.name, categoryName)
      });
      if (!category) return [];

      // Steg 2: hämta kurser med det categoryId
      return await db.query.courses.findMany({
        where: eq(courses.categoryId, category.id),
        with: { category: true, courseBlocks: true }
      });
    }
    // Inga filter – returnera alla
    return await db.query.courses.findMany({ with: { category: true, courseBlocks: true } });
  },

  async getUserCourses(userId: string) {
    return await db.query.courses.findMany({
      where: eq(courses.userId, userId),
      with: { category: true, courseBlocks: true }
    });
  },

  async getCourseById(id: number) {
    return await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        category: true,
        courseBlocks: true
      }
    });
  },

  async createCourse(data: NewCourse & { userId: string }) {
    const newCourse = await db.insert(courses).values(data).returning();
    return newCourse[0];
  },

  async updateCourse( courseId: number, userId: string, updates: Partial<NewCourse> ) {
    const updateCourse = await db.update(courses)
    .set(updates)
    .where( 
      and(
        eq(courses.id, courseId),
        eq(courses.userId, userId)
      ) 
    )
    .returning();

    return updateCourse[0];
  },

  async deleteCourse(id: number, userId: string) {
    const deleteCourse = await db.delete(courses).where(
      and (
        eq(courses.id, id),
        eq(courses.userId, userId)
      )
    ).returning()
    return deleteCourse[0];
  },
  
}
