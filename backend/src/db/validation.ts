import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod';
import { courses, quizzes, } from './schema';

export const insertCourseSchema = createInsertSchema(courses, {
  title: z.string().min(5, "Titeln måste vara minst 5 tecken"),
  videoUrl: z.string().url("Måste vara en giltig URL").optional().nullable(),
}).omit({
  id: true,
  userId: true
});

export const insertQuizSchema = createInsertSchema(quizzes, {
  questionText: z.string().min(10, "Frågan är för kort"),
}).omit({
  id: true
});

export type insertCourse = z.infer<typeof insertCourseSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;