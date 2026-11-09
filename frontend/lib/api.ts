import { Block, Course, UserCourse } from "@/types/types";
import { BACKEND_URL } from "@/lib/backend-url";
import {
  demoCategories,
  demoCourses,
  demoBlocks,
  demoQuiz,
} from "@/lib/demo-data";

export type Category = {
  id: string;
  name: string;
  iconName?: string | null;
};

export type CourseQuizOption = {
  id: string;
  text: string;
};

export type CourseQuizQuestion = {
  id: number;
  quizId: number;
  courseId: number;
  blockId: number;
  question: string;
  options: CourseQuizOption[];
};

export type CourseQuiz = {
  id: number;
  courseId: number;
  title?: string | null;
  questions: CourseQuizQuestion[];
};

export type SubmitQuizAttemptPayload = {
  courseId: number;
  answers: {
    questionId: number;
    selectedOptionId: string;
  }[];
};

export type QuizBlockPriority = {
  blockId: number;
  blockTitle?: string;
  correctCount: number;
  incorrectCount: number;
  priority: "high" | "medium" | "low";
  label: string;
};

export type SubmitQuizAttemptResponse = {
  message: string;
  attemptId: string;
  score: number;
  maxScore: number;
  blockPriorities: QuizBlockPriority[];
};

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function getCategories(): Promise<Category[]> {
  if (isDemo) {
    return demoCategories;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/categories`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Misslyckades att hämta kategorier");
    return await res.json();
  } catch (error) {
    console.warn("Backend offline or unreachable, falling back to demo categories:", error);
    return demoCategories;
  }
}

export async function getCourseQuiz(courseId: string): Promise<CourseQuiz> {
  const numId = Number(courseId) || 1;

  if (isDemo) {
    return demoQuiz[numId] ?? demoQuiz[1];
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/learning/courses/${courseId}/quiz`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Could not fetch course quiz");
    }

    const data = await response.json();
    return data.quiz ?? data;
  } catch (error) {
    console.warn("Falling back to demo quiz:", error);
    return demoQuiz[numId] ?? demoQuiz[1];
  }
}

export async function submitQuizAttempt(
  quizId: number,
  payload: SubmitQuizAttemptPayload,
): Promise<SubmitQuizAttemptResponse> {
  if (isDemo) {
    return {
      message: "Quiz genomfört!",
      attemptId: "demo-attempt-" + Date.now(),
      score: 3,
      maxScore: 3,
      blockPriorities: [
        {
          blockId: 103,
          blockTitle: "Läs kontraktet & Besittningsskydd",
          correctCount: 1,
          incorrectCount: 0,
          priority: "low",
          label: "Hög förståelse",
        },
        {
          blockId: 104,
          blockTitle: "Dolda kostnader & Hemförsäkring",
          correctCount: 1,
          incorrectCount: 0,
          priority: "low",
          label: "Hög förståelse",
        },
        {
          blockId: 105,
          blockTitle: "Inflytt & Besiktning",
          correctCount: 1,
          incorrectCount: 0,
          priority: "low",
          label: "Hög förståelse",
        },
      ],
    };
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/learning/quizzes/${quizId}/attempts`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error ?? "Could not submit quiz attempt");
    }

    return await response.json();
  } catch (error) {
    console.warn("submitQuizAttempt failed, returning mock success:", error);
    return {
      message: "Quiz genomfört (Demo)",
      attemptId: "demo-attempt-" + Date.now(),
      score: 3,
      maxScore: 3,
      blockPriorities: [],
    };
  }
}

export async function getCourses(options?: RequestInit): Promise<Course[]> {
  if (isDemo) {
    return demoCourses;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/courses`, {
      cache: "no-store",
      ...options,
    });
    if (!res.ok) throw new Error("Misslyckades att hämta kurser");
    return await res.json();
  } catch (error) {
    console.warn("Backend offline or unreachable, falling back to demo courses:", error);
    return demoCourses;
  }
}

export async function getCourseById(
  id: string,
  options?: RequestInit,
): Promise<Course> {
  const numId = Number(id);

  if (isDemo) {
    const found = demoCourses.find((c) => c.id === numId);
    return found ?? demoCourses[0];
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${id}`, {
      cache: "no-store",
      ...options,
    });
    if (!res.ok) throw new Error(`Misslyckades att hämta kurs ${id}`);
    return await res.json();
  } catch (error) {
    console.warn(`Falling back to demo course for id ${id}:`, error);
    const found = demoCourses.find((c) => c.id === numId);
    return found ?? demoCourses[0];
  }
}

export async function getCoursesByCategory(
  categoryName: string,
  options?: RequestInit,
): Promise<Course[]> {
  if (isDemo) {
    const lower = categoryName.toLowerCase();
    return demoCourses.filter(
      (c) =>
        c.category?.name.toLowerCase().includes(lower) ||
        c.title.toLowerCase().includes(lower),
    );
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/courses?category=${encodeURIComponent(categoryName)}`,
      { cache: "no-store", ...options },
    );
    if (!res.ok) throw new Error("Misslyckades att hämta kurser för kategori");
    return await res.json();
  } catch (error) {
    console.warn("Falling back to demo courses by category:", error);
    return demoCourses;
  }
}

export async function getBlocksByCourseId(
  courseId: string,
  options?: RequestInit,
): Promise<Block[]> {
  const numId = Number(courseId) || 1;

  if (isDemo) {
    return demoBlocks[numId] ?? demoBlocks[1];
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${courseId}/blocks`, {
      cache: "no-store",
      ...options,
    });
    if (!res.ok) throw new Error(`Misslyckades att hämta block för kurs ${courseId}`);
    const data = await res.json();
    return data.blocks ?? data;
  } catch (error) {
    console.warn(`Falling back to demo blocks for course ${courseId}:`, error);
    return demoBlocks[numId] ?? demoBlocks[1];
  }
}

export async function enrollInCourse(
  courseId: string,
  knowledgeLevel?: "beginner" | "intermediate" | "advanced",
): Promise<{ message: string; userCourse: UserCourse }> {
  if (isDemo) {
    const numId = Number(courseId) || 1;
    return {
      message: "Inskriven i kurs!",
      userCourse: {
        id: "demo-enrollment-" + Date.now(),
        userId: "demo-user-1",
        courseId: numId,
        status: "in_progress",
        knowledgeLevel: knowledgeLevel ?? "beginner",
        enrolledAt: new Date().toISOString(),
        completedAt: null,
        score: null,
      },
    };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${courseId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ knowledgeLevel }),
    });
    if (!res.ok) throw new Error(`Misslyckades att skriva in i kurs ${courseId}`);
    return await res.json();
  } catch (error) {
    console.warn("Falling back to mock enrollInCourse:", error);
    const numId = Number(courseId) || 1;
    return {
      message: "Inskriven i kurs (Demo)!",
      userCourse: {
        id: "demo-enrollment-" + Date.now(),
        userId: "demo-user-1",
        courseId: numId,
        status: "in_progress",
        knowledgeLevel: knowledgeLevel ?? "beginner",
        enrolledAt: new Date().toISOString(),
        completedAt: null,
        score: null,
      },
    };
  }
}
