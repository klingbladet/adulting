import CourseButton from "@/components/courses/course-buttons"
import Link from "next/link"
import { getCourses } from "@/lib/api";
import CourseListClient from "@/components/courses/course-list-client";
import { getServerSession } from "@/lib/session";

export default async function CreatorToolsPage() {
  const session = await getServerSession();
  const allCourses = await getCourses();
  const courses = allCourses.filter(course => course.userId === session?.user?.id);

  return (
    <div className="mb-10 max-w-250 bg-background text-foreground">
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-3xl text-foreground">Mina kurser</h1>
        <Link href={`/create/creator-tools/create-blocks`}>
          <CourseButton
            variant="secondary"
            fullWidth={false}>
            Skapa ny kurs
          </CourseButton>
        </Link>
      </div>
      <CourseListClient initialCourses={courses} />
    </div>
  )
}