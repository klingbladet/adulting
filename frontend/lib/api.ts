import { Block, Course, UserCourse } from "@/types/types";
import { BACKEND_URL } from "./backend-url";

const BASE_URL = `${BACKEND_URL}/api`;

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

export async function getCourseQuiz(courseId: string): Promise<CourseQuiz> {
  const response = await fetch(
    `${BASE_URL}/learning/courses/${courseId}/quiz`,
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

  // Om backend returnerar { quiz: ... }
  if (data.quiz) {
    return data.quiz;
  }

  // Om backend returnerar quiz direkt
  return data;
}

export async function submitQuizAttempt(
  quizId: number,
  payload: SubmitQuizAttemptPayload,
): Promise<SubmitQuizAttemptResponse> {
  const response = await fetch(
    `${BASE_URL}/learning/quizzes/${quizId}/attempts`,
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

    console.error("submitQuizAttempt failed:", {
      status: response.status,
      errorData,
      payload,
    });

    throw new Error(errorData?.error ?? "Could not submit quiz attempt");
  }

  return response.json();
}

export async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${BASE_URL}/courses`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Misslyckades att hämta kurser");
  return res.json();
}

export async function getCourseById(id: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/courses/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Misslyckades att hämta kurs ${id}`);
  return res.json();
}

export async function getCoursesByCategory(categoryName: string): Promise<Course[]> {
  const res = await fetch(`${BASE_URL}/courses?category=${encodeURIComponent(categoryName)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Misslyckades att hämta kurser för kategori");
  return res.json();
}

export async function getBlocksByCourseId(courseId: string): Promise<Block[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/blocks`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Misslyckades att hämta block för kurs ${courseId}`);
  const data = await res.json();
  // Backend returnerar { message: "...", blocks: [...] }
  return data.blocks ?? data;
}

export async function enrollInCourse(
  courseId: string,
  knowledgeLevel?: "beginner" | "intermediate" | "advanced"
): Promise<{ message: string; userCourse: UserCourse }> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ knowledgeLevel }),
  });
  if (!res.ok) throw new Error(`Misslyckades att skriva in i kurs ${courseId}`);
  return res.json();
}

