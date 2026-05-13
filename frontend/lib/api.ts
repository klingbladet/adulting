import { Block, Course, UserCourse } from "@/app/types/types";
import { BACKEND_URL } from "./backend-url";

const BASE_URL = `${BACKEND_URL}/api`;

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

