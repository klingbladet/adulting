import { requireRole } from "@/lib/guards";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url";
import { Course } from "@/types/types";
import AdminReviewsClient from "./admin-reviews-client";

type CourseWithTimestamps = Course & {
  createdAt?: string;
  updatedAt?: string;
};

// Vi hämtar alla kurser och filtrerar lokalt i frontend
// eftersom vi inte kan/får ändra backendens getAllCourses just nu.
async function getAllAdminCourses(): Promise<CourseWithTimestamps[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = new URL(`${BACKEND_URL}/api/courses`);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch admin courses: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.courses || data;
}

export default async function AdminReviewsListPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireRole(["admin"]);
  const resolvedParams = await searchParams;
  const statusParam = resolvedParams?.status;

  const allCourses = await getAllAdminCourses();
  
  // Filtrera kurserna här i frontend 
  const pendingCourses = allCourses.filter(c => c.status === 'pending_approval');
  const rejectedCourses = allCourses.filter(c => c.status === 'rejected');
  const publishedCourses = allCourses.filter(c => c.status === 'published' && c.isPublished);

  return (
    <AdminReviewsClient 
      pendingCourses={pendingCourses} 
      rejectedCourses={rejectedCourses} 
      publishedCourses={publishedCourses}
      statusParam={statusParam} 
    />
  );
}