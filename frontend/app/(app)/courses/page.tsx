import BlockCard from "@/components/courses/course-layout";
import Link from "next/link";
import { getCourses } from "@/lib/api";
import getCourseIcon from "@/components/courses/course-dynamic-icon";
import { Course } from "@/types/types";
import { UserCourse } from "@/types/types";
import { cookies } from "next/headers";

type CourseWithPublishStatus = Course & { 
  isPublished?: boolean;
  userCourses?: UserCourse[];
  enrollments?: UserCourse[];
};

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const allCourses = await getCourses({
    headers: {
      cookie: cookieStore.toString()
    }
  });

  // Filtrera så att endast publicerade kurser visas för vanliga användare
  const publishedCourses = allCourses.filter((course: CourseWithPublishStatus) => course.isPublished === true);

  return (
    <div className="relative mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Alla kurser</h1>
      <p className="mt-2 mb-10 text-muted-foreground">
        Välj vilken kurs du vill göra
      </p>
      
      <div className="flex flex-col gap-4">
        {publishedCourses.length > 0 ? (
          publishedCourses.map((course: CourseWithPublishStatus) => {
            const enrollment = course.enrollments?.[0] || course.userCourses?.[0];
            const hasStarted = enrollment && enrollment.status !== "not_started";
            const targetUrl = hasStarted 
              ? `/courses/${course.id}/overview` 
              : `/courses/${course.id}`;
            
            return (
              <Link key={course.id} href={targetUrl}>
                <BlockCard
                    icon={getCourseIcon(course)}
                    title={course.title}
                    time={course.time}
                />
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground italic">Inga publicerade kurser hittades ännu.</p>
        )}
      </div>
    </div>
  );
}
