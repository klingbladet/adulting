/**
 * Learning context helpers for AI-chatten.
 *
 * Frontend skickar bara var användaren befinner sig.
 * Backend hämtar användarspecifik data, t.ex. quizresultat.
 */

export type LearningContextMode =
  | "general"
  | "lesson_help"
  | "quiz_review"
  | "course_recommendation";

export type AiLearningContext = {
  courseId?: string;
  lessonId?: string;
  currentBlockId?: string;
  mode?: LearningContextMode;
};

export function createLessonLearningContext(input: {
  courseId: string;
  lessonId: string;
  currentBlockId?: string;
  mode?: LearningContextMode;
}): AiLearningContext {
  return {
    courseId: input.courseId,
    lessonId: input.lessonId,
    currentBlockId: input.currentBlockId,
    mode: input.mode ?? "lesson_help",
  };
}

export function createQuizReviewLearningContext(input: {
  courseId: string;
  lessonId?: string;
  currentBlockId?: string;
}): AiLearningContext {
  return {
    courseId: input.courseId,
    lessonId: input.lessonId,
    currentBlockId: input.currentBlockId,
    mode: "quiz_review",
  };
}

export function createCourseRecommendationLearningContext(input: {
  courseId: string;
}): AiLearningContext {
  return {
    courseId: input.courseId,
    mode: "course_recommendation",
  };
}

export function hasLearningContext(
  learningContext: AiLearningContext | undefined,
): boolean {
  return Boolean(
    learningContext?.courseId ||
      learningContext?.lessonId ||
      learningContext?.currentBlockId,
  );
}