import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db";
import {
  blocks,
  courses,
  quizAnswers,
  quizAttempts,
  quizQuestions,
} from "../../db/schema";

export async function getCurrentCourseContext(input: {
  courseId?: string;
}) {
  const { courseId } = input;

  if (!courseId) {
    return {
      found: false,
      reason: "NO_COURSE_ID",
      message: "No courseId was provided.",
    };
  }

  const numericCourseId = Number(courseId);

  if (Number.isNaN(numericCourseId)) {
    return {
      found: false,
      reason: "INVALID_COURSE_ID",
      message: "courseId must be numeric.",
      courseId,
    };
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, numericCourseId),
  });

  if (!course) {
    return {
      found: false,
      reason: "COURSE_NOT_FOUND",
      message: "Course was not found.",
      courseId,
    };
  }

  return {
    found: true,
    course: {
      id: course.id,
      title: course.title,
      textContent: course.textContent,
      time: course.time,
      blocks: course.blocks,
      status: course.status,
      isPublished: course.isPublished,
    },
  };
}

export async function getCurrentCourseQuizResult(input: {
  userId: string;
  courseId?: string;
}) {
  const { userId, courseId } = input;

  if (!courseId) {
    return {
      found: false,
      reason: "NO_COURSE_ID",
      message: "No courseId was provided.",
    };
  }

  const numericCourseId = Number(courseId);

  if (Number.isNaN(numericCourseId)) {
    return {
      found: false,
      reason: "INVALID_COURSE_ID",
      message: "courseId must be numeric.",
      courseId,
    };
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, numericCourseId),
  });

  if (!course) {
    return {
      found: false,
      reason: "COURSE_NOT_FOUND",
      message: "Course was not found.",
      courseId,
    };
  }

  const latestAttempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.courseId, numericCourseId),
    ),
    orderBy: desc(quizAttempts.completedAt),
  });

  if (!latestAttempt) {
    return {
      found: true,
      course: {
        id: course.id,
        title: course.title,
      },
      hasQuizResult: false,
      message: "No quiz attempt was found for this user and course.",
    };
  }

  const answers = await db
    .select({
      questionId: quizAnswers.questionId,
      selectedOptionId: quizAnswers.selectedOptionId,
      isCorrect: quizAnswers.isCorrect,
      blockId: quizAnswers.blockId,
      blockTitle: blocks.title,
      question: quizQuestions.question,
    })
    .from(quizAnswers)
    .leftJoin(blocks, eq(quizAnswers.blockId, blocks.id))
    .leftJoin(quizQuestions, eq(quizAnswers.questionId, quizQuestions.id))
    .where(eq(quizAnswers.attemptId, latestAttempt.id));

  const totalAnswers = answers.length;
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const incorrectAnswers = totalAnswers - correctAnswers;

  const scorePercent =
    latestAttempt.maxScore > 0
      ? Math.round((latestAttempt.score / latestAttempt.maxScore) * 100)
      : totalAnswers > 0
        ? Math.round((correctAnswers / totalAnswers) * 100)
        : 0;

  const blockStats = new Map<
    number,
    {
      blockId: number;
      blockTitle: string;
      correctCount: number;
      incorrectCount: number;
    }
  >();

  for (const answer of answers) {
    const current = blockStats.get(answer.blockId) ?? {
      blockId: answer.blockId,
      blockTitle: answer.blockTitle ?? `Block ${answer.blockId}`,
      correctCount: 0,
      incorrectCount: 0,
    };

    if (answer.isCorrect) {
      current.correctCount += 1;
    } else {
      current.incorrectCount += 1;
    }

    blockStats.set(answer.blockId, current);
  }

  const blockPriorities = Array.from(blockStats.values())
    .map((block) => {
      const totalForBlock = block.correctCount + block.incorrectCount;
      const incorrectRatio =
        totalForBlock === 0 ? 0 : block.incorrectCount / totalForBlock;

      const priority =
        incorrectRatio >= 0.6
          ? "high"
          : incorrectRatio >= 0.3
            ? "medium"
            : "low";

      return {
        ...block,
        priority,
        label:
          priority === "high"
            ? "Behöver repeteras först"
            : priority === "medium"
              ? "Bra att öva mer på"
              : "Ser stabilt ut",
      };
    })
    .sort((a, b) => b.incorrectCount - a.incorrectCount);

  const missedQuestions = answers
    .filter((answer) => !answer.isCorrect)
    .slice(0, 5)
    .map((answer) => ({
      questionId: answer.questionId,
      question: answer.question,
      blockId: answer.blockId,
      blockTitle: answer.blockTitle,
      selectedOptionId: answer.selectedOptionId,
    }));

  return {
    found: true,
    course: {
      id: course.id,
      title: course.title,
    },
    hasQuizResult: true,
    attempt: {
      id: latestAttempt.id,
      quizId: latestAttempt.quizId,
      status: latestAttempt.status,
      score: latestAttempt.score,
      maxScore: latestAttempt.maxScore,
      scorePercent,
      completedAt: latestAttempt.completedAt,
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
    },
    blockPriorities,
    missedQuestions,
  };
}

export async function getCurrentCourseLearningContext(input: {
  userId: string;
  courseId?: string;
}) {
  const [courseContext, quizResult] = await Promise.all([
    getCurrentCourseContext({
      courseId: input.courseId,
    }),
    getCurrentCourseQuizResult({
      userId: input.userId,
      courseId: input.courseId,
    }),
  ]);

  return {
    courseContext,
    quizResult,
  };
}

export function formatCourseContextForPrompt(
  result: Awaited<ReturnType<typeof getCurrentCourseContext>>,
) {
  const course = "course" in result ? result.course : undefined;

  if (!result.found || !course) {
    return [
      "Aktuell kurs:",
      `- Status: ${result.reason}`,
      `- Meddelande: ${result.message}`,
    ].join("\n");
  }

  return [
    "Aktuell kurs:",
    `- Course ID: ${course.id}`,
    `- Kursnamn: ${course.title}`,
    course.textContent ? `- Beskrivning: ${course.textContent}` : null,
    course.time ? `- Uppskattad tid: ${course.time} minuter` : null,
    course.blocks ? `- Antal block: ${course.blocks}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function formatQuizResultForPrompt(
  result: Awaited<ReturnType<typeof getCurrentCourseQuizResult>>,
) {
  const attempt = "attempt" in result ? result.attempt : undefined;
  const blockPriorities =
  "blockPriorities" in result && result.blockPriorities
    ? result.blockPriorities
    : [];

const missedQuestions =
  "missedQuestions" in result && result.missedQuestions
    ? result.missedQuestions
    : [];

  if (!result.found) {
    return [
      "Quizresultat:",
      `- Status: ${result.reason}`,
      `- Meddelande: ${result.message}`,
    ].join("\n");
  }

  if (!result.hasQuizResult || !attempt) {
    return [
      "Quizresultat:",
      "- Inget quizresultat finns för den här kursen ännu.",
    ].join("\n");
  }

  return [
    "Quizresultat:",
    `- Resultat: ${attempt.score} av ${attempt.maxScore}`,
    `- Procent: ${attempt.scorePercent}%`,
    `- Rätt svar: ${attempt.correctAnswers}`,
    `- Fel svar: ${attempt.incorrectAnswers}`,
    `- Antal svar: ${attempt.totalAnswers}`,
    `- Status: ${attempt.status}`,
    attempt.completedAt
      ? `- Genomfördes: ${attempt.completedAt.toISOString()}`
      : null,
    "",
    blockPriorities.length
      ? [
          "Blockprioritering baserat på quiz:",
          ...blockPriorities.map((block) => {
            return `- ${block.blockTitle}: ${block.correctCount} rätt, ${block.incorrectCount} fel, prioritet: ${block.priority}`;
          }),
        ].join("\n")
      : "Blockprioritering baserat på quiz: ingen blockdata hittades.",
    "",
    missedQuestions.length
      ? [
          "Frågor användaren svarade fel på:",
          ...missedQuestions.map((answer) => {
            return `- ${answer.question ?? `Fråga ${answer.questionId}`}`;
          }),
        ].join("\n")
      : "Frågor användaren svarade fel på: inga fel hittades.",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}