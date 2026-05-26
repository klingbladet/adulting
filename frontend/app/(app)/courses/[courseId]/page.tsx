import Link from 'next/link';
import CourseButton from '@/components/courses/course-buttons';
import { ChevronRight } from 'lucide-react';
import { getCourseById } from '@/lib/api';
import getCourseIcon from '@/components/courses/course-dynamic-icon';
import { redirect } from 'next/navigation';
import { UserCourse } from '@/types/types';
import { cookies } from 'next/headers';

export default async function CourseStartPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const course = await getCourseById(courseId, {
    headers: {
      cookie: cookieStore.toString()
    }
  }).catch(() => null);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-xl font-bold mb-4">Hoppsan!</h1>
        <p>Kunde inte ladda kursen just nu.</p>
        <Link href="/courses" className="mt-4 text-primary underline">
          Tillbaka till alla kurser
        </Link>
      </div>
    );
  }

  // Kontrollera om användaren redan har startat/registrerat sig på kursen via tabellen userCourses.
  // Drizzle returnerar vanligtvis denna relation som 'enrollments'.
  const enrollments = course.enrollments || course.userCourses || [];
  const enrollment = enrollments[0];

  if (enrollment && enrollment.status !== 'not_started') {
    redirect(`/courses/${courseId}/overview`);
  }

  return (
    <main className="flex flex-col min-h-screen bg-background relative mx-auto max-w-5xl mt-10">
      <div className="flex flex-col items-center p-8 text-center">
        <div className="w-50 h-50 bg-primary rounded-full flex items-center justify-center mb-8 relative">
          <div className="bg-card p-6 rounded-xl shadow-2xl w-25 h-25 ">
            {getCourseIcon(course)}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-4 leading-tight">
          {course.title}
        </h1>

        <p className="text-secondary-foreground text-lg ">
          {course.textContent}
        </p>
      </div>

      <div className="flex justify-center gap-4 text-xs font-medium">
        <div className="bg-red-200 text-black p-1 px-3 rounded-full">
          {course.time + " min"}
        </div>
        <div className="bg-green-200 text-black p-1 px-3 rounded-full">
          {course.blocks + " steg"}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 pb-12 mt-10">
        <Link href={`/courses/${courseId}/personalize`}>
          <CourseButton className="mt-10" variant="primary">
            Gör quiz och starta kursen
            <ChevronRight size={20} />
          </CourseButton>
        </Link>
      </div>
    </main>
  );
}
