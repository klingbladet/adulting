/**
 * Learning context helpers for the frontend AI chat.
 *
 * Den här filen hjälper frontend att skicka rätt context till backend-chatten.
 *
 * Backend-routen:
 *
 * POST /api/ai/threads/:threadId/messages
 *
 * kan nu ta emot:
 *
 * {
 *   message: "...",
 *   learningContext: {
 *     courseId,
 *     lessonId,
 *     mode,
 *     quizAnswers
 *   }
 * }
 *
 * TODO när studentflödet är klart:
 * - courseId ska komma från aktuell kurs.
 * - lessonId ska komma från aktuell lektion.
 * - quizAnswers ska inte vara demo-data.
 * - quizAnswers bör komma från senaste quiz attempt eller backend.
 */

export type LearningContextMode =
  | "general"
  | "lesson_help"
  | "quiz_review"
  | "course_recommendation";

export type LearningContextQuizAnswer = {
  blockId: string;
  isCorrect: boolean;
};

export type AiLearningContext = {
  courseId?: string;
  lessonId?: string;
  mode?: LearningContextMode;
  quizAnswers?: LearningContextQuizAnswer[];
};

/**
 * Demo lesson IDs som finns i backend just nu.
 *
 * Dessa kommer från:
 *
 * backend/src/services/learning/mock-lessons.ts
 */
export type DemoLessonId = "lesson_bolan_001" | "lesson_hyreskontrakt_001";

export const demoLearningLessons: Array<{
  lessonId: DemoLessonId;
  courseId: string;
  title: string;
  weakBlockId: string;
  exampleQuestion: string;
}> = [
  {
    lessonId: "lesson_bolan_001",
    courseId: "course_bostad_001",
    title: "Förstå bolån",
    weakBlockId: "block_bolan_text_004",
    exampleQuestion: "Kan du förklara kontantinsats enklare?",
  },
  {
    lessonId: "lesson_hyreskontrakt_001",
    courseId: "course_bostad_001",
    title: "Förstå hyreskontrakt",
    weakBlockId: "block_hyra_text_002",
    exampleQuestion: "Vad ska jag kolla innan jag skriver på ett hyreskontrakt?",
  },
];

/**
 * Skapar learningContext för en demo-lektion.
 *
 * Den simulerar att eleven har svarat fel på två frågor
 * kopplade till ett specifikt block.
 *
 * Det gör att AI-assistenten får veta:
 *
 * "Det här blocket är ett weak area."
 *
 * TODO senare:
 * Ersätt detta med riktig quiz-attempt data.
 */
export function createDemoLearningContext(
  lessonId: DemoLessonId = "lesson_bolan_001",
): AiLearningContext {
  const lesson =
    demoLearningLessons.find((item) => item.lessonId === lessonId) ??
    demoLearningLessons[0];

  return {
    courseId: lesson.courseId,
    lessonId: lesson.lessonId,
    mode: "lesson_help",
    quizAnswers: [
      {
        blockId: lesson.weakBlockId,
        isCorrect: false,
      },
      {
        blockId: lesson.weakBlockId,
        isCorrect: false,
      },
    ],
  };
}

/**
 * Skapar learningContext utan quizAnswers.
 *
 * Bra när eleven bara är inne på en lektion,
 * men ännu inte har gjort quiz.
 */
export function createLessonLearningContext(input: {
  courseId: string;
  lessonId: string;
  mode?: LearningContextMode;
}): AiLearningContext {
  return {
    courseId: input.courseId,
    lessonId: input.lessonId,
    mode: input.mode ?? "lesson_help",
  };
}

/**
 * Skapar learningContext med riktiga quiz answers.
 *
 * Detta är den funktion ni sannolikt använder senare när quiz playern finns.
 */
export function createQuizAwareLearningContext(input: {
  courseId: string;
  lessonId: string;
  mode?: LearningContextMode;
  quizAnswers: LearningContextQuizAnswer[];
}): AiLearningContext {
  return {
    courseId: input.courseId,
    lessonId: input.lessonId,
    mode: input.mode ?? "quiz_review",
    quizAnswers: input.quizAnswers,
  };
}

/**
 * Liten helper för att avgöra om context faktiskt innehåller något
 * som backend kan använda.
 */
export function hasLearningContext(
  learningContext: AiLearningContext | undefined,
): boolean {
  return Boolean(learningContext?.courseId || learningContext?.lessonId);
}