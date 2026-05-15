import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod';
import { courses, quizzes, blocks, quizQuestions, quizAnswers } from './course-schema';

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
  orderIndex: z.number(),
}).omit({
  id: true,
  courseId: true,
  userId: true
});

export const insertQuizSchema = createInsertSchema(quizzes, {
  title: z.string().min(3, "titeln är för kort"),
  description: z.string().min(10, "Beskrivningen är för kort"),
}).omit({
  id: true,
  courseId: true,
  createdBy: true
});

export const insertQuizQuestionsSchema = createInsertSchema(quizQuestions, {
  question: z.string().min(10, "Frågan är för kort"),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
  correctOptionId: z.string().length(1, "Måste ha ett rätt svar"),
  orderIndex: z.number(),
}).omit({
  id: true,
  quizId: true,
  blockId: true,
  courseId: true,
  createdBy: true
});

export const insertQuizAnswersSchema = createInsertSchema(quizAnswers, {
  selectedOptionId: z.string().length(1),
  isCorrect: z.boolean(),
}).omit({
  id: true,
  attemptId: true,
  questionId: true,
  quizId: true,
  courseId: true,
  blockId: true
});

export type insertCourse = z.infer<typeof insertCourseSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;