import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod';
import { courses, quizzes, blocks } from './course-schema';

export const insertCourseSchema = createInsertSchema(courses, {
  title: z.string().min(5, "Titeln måste vara minst 5 tecken"),
}).omit({
  id: true,
  userId: true
});

export const tiptapContentSchema = z.object({
  type: z.string(),
  content: z.array(z.any()),
});

export const insertBlockSchema = createInsertSchema(blocks, {
  title: z.string().min(5, "Titeln måste vara minst 5 tecken"),
  content: tiptapContentSchema,
  orderIndex: z.number()
});


export const insertQuizSchema = createInsertSchema(quizzes, {
  questionText: z.string().min(10, "Frågan är för kort"),
}).omit({
  id: true
});

export type insertCourse = z.infer<typeof insertCourseSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;