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
    <div className="relative w-full min-h-screen bg-white dark:bg-background font-sans text-foreground pb-28 md:max-w-5xl md:mx-auto md:px-8 md:py-14 px-5 pt-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground">Mina kurser</h1>
          <p className="text-sm text-muted-foreground mt-2">Skapa och hantera ditt innehåll</p>
        </div>
        <Link href={`/create/creator-tools/create-blocks`}>
          <CourseButton
            variant="secondary"
            fullWidth={false}>
            Skapa ny
          </CourseButton>
        </Link>
      </div>
      <CourseListClient initialCourses={courses} />
    </div>
  )
}