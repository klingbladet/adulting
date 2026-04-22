import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod';
import { courses } from './course-schema';

export const insertCourseSchema = createInsertSchema(courses, {
  title: (s) => s.title.min(5, "Titeln måste vara minst 5 tecken"),
  videoUrl: (s) => s.videoUrl.url("Måste vara en giltig URL"),
})

export const insertQuizSchema = createInsertSchema(quizzes, {
  questionText: (s) => s.questionText.min(10, "Frågan är för kort"),
});

export type insertCourse = z.infer<typeof insertCourseSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;