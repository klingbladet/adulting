'use client';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import Link from 'next/link'
import { use } from 'react';
import { getCourse } from '@/lib/course-data';

export default function CourseOverview({ params }: { params: Promise <{ courseId: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.courseId;
  const course = getCourse(courseId);

  if (!course) {
    return (
      <div className="p-6 text-foreground">
        <h1 className="text-xl font-bold">Kursen hittades inte</h1>
        <p>Kunde inte hitta kursen {courseId}</p>
      </div>
    );
  }
  
  return (
    <>
      <h1 className="text-center mb-10 text-4xl">Snabböversikt</h1>
      <div className="flex flex-col gap-4 p-6 bg-background min-h-screen">
        <p className='text-center'>Sammanfattning...</p>
      <Link href={`/courses/${courseId}/personalize`}>
        <CourseButton className="mt-10" variant="primary">
          Gå till personalisering
        </CourseButton>
      </Link>
      <Link href={`/courses/${courseId}/course-map`}>
        <CourseButton variant="primary">
          Gå direkt till kursen
        </CourseButton>
      </Link>
      </div>
    </>
  );
}
