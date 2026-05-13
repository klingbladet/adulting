import { db } from "../db";
import { courses } from "../db/schema";
import { insertCourseSchema } from "../db/validation";
import { z } from "zod";
import { categories } from "../db/schema";
import { eq, ilike } from "drizzle-orm";

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
        with: { category: true }
      });
    }
    // Inga filter – returnera alla
    return await db.query.courses.findMany({ with: { category: true } });
  },



  async getCourseById(id: number) {
    return await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        category: true
      }
    });
  },

  async createCourse(data: NewCourse & { userId: string }) {
    const newCourse = await db.insert(courses).values(data).returning();
    return newCourse[0];
  },
}

