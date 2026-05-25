import { getCourses } from "@/lib/api";
import { Course, UserCourse } from "@/types/types";
import { cookies } from "next/headers";
import CoursesClient from "@/components/courses/courses-client";

type CourseWithPublishStatus = Course & {
  isPublished?: boolean;
  userCourses?: UserCourse[];
  enrollments?: UserCourse[];
};

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const allCourses = await getCourses({
    headers: { cookie: cookieStore.toString() },
  });

  const publishedCourses = allCourses.filter(
    (course: CourseWithPublishStatus) => course.isPublished === true,
  );

  // Beräkna insikter
  const totalEnrolled = publishedCourses.filter((c: CourseWithPublishStatus) => {
    const e = c.enrollments?.[0] || c.userCourses?.[0];
    return !!e;
  }).length;

  const completedCourses = publishedCourses.filter((c: CourseWithPublishStatus) => {
    const e = c.enrollments?.[0] || c.userCourses?.[0];
    return e?.status === "completed";
  }).length;

  return (
    <div className="mt-5 relative w-full min-h-screen bg-white dark:bg-background font-sans text-foreground pb-28 md:max-w-5xl md:mx-auto md:px-8 md:py-14">
      {/* ── Main content ── */}
      <main className="flex flex-col pt-6 space-y-8">

        {/* Course grid + filters + insikt */}
        <section>
          <h2 className="text-4xl font-extrabold text-foreground mb-10">
            Kurser
          </h2>

          <CoursesClient
            courses={publishedCourses}
            totalEnrolled={totalEnrolled}
            completedCourses={completedCourses}
          />
        </section>

      </main>
    </div>
  );
}
