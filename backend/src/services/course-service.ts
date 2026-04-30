import { db } from "../db";
import { courses } from "../db/schema";
import { insertCourseSchema } from "../db/validation";
import { z } from "zod";

type NewCourse = z.infer<typeof insertCourseSchema>;

export const courseService = {
  async getAllCourses() {
    return await db.select().from(courses);
  },

  async createCourse(data: NewCourse & { userId: string }) {
    const newCourse = await db.insert(courses).values(data).returning();
    return newCourse[0];
  },
}

