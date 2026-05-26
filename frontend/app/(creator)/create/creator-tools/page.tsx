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
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex flex-row justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
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