import BlockCard from "@/components/courses/course-layout";
import Link from "next/link";
import { getCoursesByCategory } from "@/lib/api";
import getCourseIcon from "@/components/courses/course-dynamic-icon";
import { Course } from "@/types/types";

type CourseWithPublishStatus = Course & { isPublished?: boolean };

export default async function UserDashboardPage() {
  const allCourses = await getCoursesByCategory("jobb");
  const publishedCourses = allCourses.filter((course: CourseWithPublishStatus) => course.isPublished === true);

  return (
    <div className="mt-10">
      <h1 className="text-4xl font-bold">Jobb</h1>
      <p className="mt-2 mb-10 text-muted-foreground">
        Välj vilken kurs du vill göra
      </p>

      <div className="flex flex-col gap-4">
        {publishedCourses.length > 0 ? (
          publishedCourses.map((course: CourseWithPublishStatus) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <BlockCard
                icon={getCourseIcon(course)}
                title={course.title}
                time={course.time}
              />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">Inga publicerade kurser hittades ännu.</p>
        )}
      </div>
    </div>
  );
}
