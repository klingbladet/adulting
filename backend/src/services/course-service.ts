import { db } from "../db";
import { courses } from "../db/schema";
import { insertCourseSchema } from "../db/validation";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

type NewCourse = z.infer<typeof insertCourseSchema>;

export const courseService = {
  async getAllCourses() {
    return await db.query.courses.findMany({
      with: {
        category: true
      }
    });
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

