import { requireRole } from "@/lib/guards";
import Link from "next/link";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url";
import { Course } from "@/types/types";

type CourseWithTimestamps = Course & {
  createdAt?: string;
  updatedAt?: string;
};

async function getPendingCourses(): Promise<CourseWithTimestamps[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = new URL(`${BACKEND_URL}/api/courses`);
  url.searchParams.append('status', 'pending_approval');

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch pending courses: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.courses || data;
}

export default async function AdminReviewsListPage() {
  await requireRole(["admin"]);
  const courses = await getPendingCourses();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Väntande granskningar</h1>
      <p className="text-gray-500 mb-8">Kurser som har skickats in av kreatörer och väntar på ditt godkännande.</p>

      {courses.length === 0 ? (
        <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow-sm border border-gray-100">Det finns inga kurser att granska just nu.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <div key={course.id} className="p-4 border border-gray-100 rounded-lg bg-white flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{course.title || "Kurs utan titel"}</h3>
                <p className="text-sm text-gray-500">
                  Inskickad för granskning
                  {course.updatedAt && ` • ${new Date(course.updatedAt).toLocaleDateString('sv-SE')}`}
                </p>
              </div>
              <Link href={`/create/admin/reviews/${course.id}`}>
                <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Granska kurs
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}