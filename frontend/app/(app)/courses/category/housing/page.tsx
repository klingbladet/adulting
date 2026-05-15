import BlockCard from "@/components/courses/course-layout";
import Link from "next/link";
import { getCoursesByCategory } from "@/lib/api";
import getCourseIcon from "@/components/courses/course-dynamic-icon";

export default async function UserDashboardPage() {
  const courses = await getCoursesByCategory("bostad");

  return (
    <div>
      <h1 className="text-2xl font-bold">Housing</h1>
      <p className="mt-2 mb-10 text-muted-foreground">
        Välj vilken kurs du vill göra
      </p>
      
      <div className="flex flex-col gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <BlockCard
                  icon={getCourseIcon(course)}
                  title={course.title}
                  time={course.time}
              />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">Inga kurser hittades ännu.</p>
        )}
      </div>
    </div>
  );
}
