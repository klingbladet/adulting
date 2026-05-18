import CourseButton from "@/components/courses/course-buttons"
import Link from "next/link"
import BlockCard from "@/components/courses/course-layout";
import { getCourses } from "@/lib/api";
import getCourseIcon from "@/components/courses/course-dynamic-icon";

const getSteps = (blocks: unknown) => {
  if (typeof blocks === 'number') return blocks;
  if (Array.isArray(blocks)) return blocks.length;
  return undefined;
};

export default async function CreatorToolsPage() {
  const courses = await getCourses();

  return(
    <div className="mb-10 max-w-250">
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-3xl">Mina kurser</h1>
        <Link href={`/create/creator-tools/create-blocks`}>
          <CourseButton 
            variant="secondary"
            fullWidth={false}>
              Skapa ny kurs
          </CourseButton>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.id} href={`/create/creator-tools/create-blocks?courseId=${course.id}`}>
              <BlockCard
                  icon={getCourseIcon(course)}
                  title={course.title}
                  time={course.time}
                  steps={getSteps(course.blocks)}
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