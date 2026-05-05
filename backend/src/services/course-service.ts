import { db } from "../db";
import { courses } from "../db/schema";
import { insertCourseSchema } from "../db/validation";
import { z } from "zod";
import { eq } from "drizzle-orm";

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
}

