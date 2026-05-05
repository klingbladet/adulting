import { Course } from "@/app/types/types";
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
