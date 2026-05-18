import CourseButton from "@/components/courses/course-buttons"
import Link from "next/link"
import BlockCard from "@/components/courses/course-layout";
import { getCourses } from "@/lib/api";
import getCourseIcon from "@/components/courses/course-dynamic-icon";

export default async function CreatorToolsPage() {
  const courses = await getCourses();

  return(
    <div className="mb-10">
      <h1 className="text-3xl mb-10">Mina kurser</h1>
      <Link href={`/create/creator-tools/create-course`}>
        <CourseButton 
          className="" 
          variant="secondary">
            Skapa ny kurs
        </CourseButton>
      </Link>
      <div className="flex flex-col gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.id} href={`/edit`}>
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
  )
}