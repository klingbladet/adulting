import { z } from "zod";

/**
 * Shared learning domain types.
 *
 * Detta är kontraktet mellan:
 * - lessonbuildern
 * - quiz-generatorn
 * - MCP-servern
 * - AI-assistenten
 * - framtida studentflöde
 */

export const lessonBlockTypeSchema = z.enum([
  "heading",
  "text",
  "image",
  "video",
  "code",
  "quote",
]);

export type LessonBlockType = z.infer<typeof lessonBlockTypeSchema>;

export const lessonBlockContentSchema = z.object({
  text: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  transcript: z.string().optional(),
  code: z.string().optional(),
  language: z.string().optional(),
});

export type LessonBlockContent = z.infer<typeof lessonBlockContentSchema>;

export const lessonBlockSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  type: lessonBlockTypeSchema,
  order: z.number().int().nonnegative(),
  content: lessonBlockContentSchema,
  quizEligible: z.boolean().optional(),
});

export type LessonBlock = z.infer<typeof lessonBlockSchema>;

/**
 * VIKTIG EXPORT.
 *
 * Detta är schemat som lesson-provider.ts försöker använda.
 * Felet du fick beror på att denna export saknas eller inte finns i runtime.
 */
export const lessonWithBlocksSchema = z.object({
  lesson: z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    description: z.string().optional(),
  }),
  blocks: z.array(lessonBlockSchema),
});

export type LessonWithBlocks = z.infer<typeof lessonWithBlocksSchema>;

export const quizQuestionTypeSchema = z.enum(["multiple_choice"]);

export type QuizQuestionType = z.infer<typeof quizQuestionTypeSchema>;

export const quizOptionIdSchema = z.enum(["A", "B", "C", "D"]);

export type QuizOptionId = z.infer<typeof quizOptionIdSchema>;

export const generatedQuizOptionSchema = z.object({
  id: quizOptionIdSchema,
  text: z.string().min(1),
});

export type GeneratedQuizOption = z.infer<
  typeof generatedQuizOptionSchema
>;

export const generatedQuizQuestionSchema = z.object({
  blockId: z.string(),
  type: quizQuestionTypeSchema.default("multiple_choice"),
  question: z.string().min(1),
  options: z.array(generatedQuizOptionSchema).length(4),
  correctOptionId: quizOptionIdSchema,
  explanation: z.string().min(1),
});

export type GeneratedQuizQuestion = z.infer<
  typeof generatedQuizQuestionSchema
>;

export const generatedQuizSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(1),
  questions: z.array(generatedQuizQuestionSchema).min(1),
});

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;

export const generateQuizInputSchema = z.object({
  lessonId: z.string(),
  questionCountPerBlock: z.number().int().positive().default(2),
  language: z.enum(["sv", "en"]).default("sv"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  saveAsDraft: z.boolean().default(false),
});

export type GenerateQuizInput = z.infer<typeof generateQuizInputSchema>;

export const generateQuizResultSchema = z.object({
  lessonId: z.string(),
  quizId: z.string().optional(),
  status: z.enum(["preview", "draft"]),
  questionsCreated: z.number().int().nonnegative(),
  quiz: generatedQuizSchema,
});

export type GenerateQuizResult = z.infer<
  typeof generateQuizResultSchema
>;

export const quizAnswerForPrioritySchema = z.object({
  blockId: z.string(),
  isCorrect: z.boolean(),
});

export type QuizAnswerForPriority = z.infer<
  typeof quizAnswerForPrioritySchema
>;

export const blockPrioritySchema = z.enum(["high", "medium", "low"]);

export type BlockPriority = z.infer<typeof blockPrioritySchema>;

export const blockPriorityResultSchema = z.object({
  blockId: z.string(),
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  masteryScore: z.number().min(0).max(1),
  priority: blockPrioritySchema,
});

export type BlockPriorityResult = z.infer<
  typeof blockPriorityResultSchema
>;

/**
 * Generic JSON-liknande data.
 *
 * Bra att ha senare när vi ska mappa onboarding eller block-content
 * från databasformat.
 *
 * Zod v4 kräver:
 * z.record(keySchema, valueSchema)
 */
export const unknownRecordSchema = z.record(
  z.string(),
  z.unknown(),
);

export type UnknownRecord = z.infer<typeof unknownRecordSchema>;