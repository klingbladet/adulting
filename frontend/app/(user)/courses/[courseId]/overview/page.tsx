'use client';
import StepCard from '@/components/ui/lessons/course/course-layout';
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
      <h1 className="text-center mb-10 text-4xl">{course.title}</h1>
      <div className="flex flex-col gap-4 p-6 bg-background min-h-screen">
        {course.steps.map((step, index) => (
          <Link key={step.id} href={`/courses/${courseId}/steps/${step.id}`}>
            <StepCard 
              icon={<span className="font-bold text-lg">{index + 1}</span>}
              title={step.title}
              description={step.text.substring(0, 40) + "..."}
            />
          </Link>
        ))}

        <Link href={`/courses/${courseId}/steps/1`}>
          <CourseButton className="mt-10" variant="primary">
            Starta kursen
          </CourseButton>
        </Link>
      </div>
    </>
  );
}
