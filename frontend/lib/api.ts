import { Course } from "@/app/types/types";

// Vi använder localhost:3001 för anrop från klienten och backend:3001 för anrop från servern (om du kör Docker)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
