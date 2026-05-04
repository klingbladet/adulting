import React from 'react';
import Link from 'next/link';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import { ChevronRight, Home } from 'lucide-react';
import { getCourse } from '@/lib/course-data';

export default async function CourseStartPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourse(courseId) ||  "error";

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Övre sektion med illustration/ikon */}
      <div className="flex flex-col items-center p-8 text-center">
        
        {/* Placeholder för din illustration (den stora blå cirkeln med huset) */}
        <div className="w-50 h-50 bg-primary rounded-full flex items-center justify-center mb-8 relative">
          <div className="bg-card p-6 rounded-xl shadow-2xl ">
             <Home size={80} className="text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground mb-4 leading-tight">
          {course.title}
        </h1>
        
        <p className="text-secondary-foreground text-lg ">
          {course.summary}
        </p>
      </div>
      <div className="flex justify-center gap-4 text-xs font-medium">
        <div className="bg-muted text-muted-foreground p-1 px-3 rounded-full">
          {course.time}
        </div>
        <div className="bg-muted text-muted-foreground p-1 px-3 rounded-full">
          {course.skillLevel}
        </div>
        <div className="bg-muted text-muted-foreground p-1 px-3 rounded-full">
          {course.totalSteps} steg
        </div>
      </div>

      {/* Nedre sektion med knapp */}
      <div className="flex flex-col gap-3 p-6 pb-12 mt-10">
        <Link href={`/courses/${courseId}/personalize`}>
          <CourseButton className="mt-10" variant="primary">
            Gå till personalisering
          </CourseButton>
        </Link>
        <Link href={`/courses/${courseId}/overview`}>
          <CourseButton variant="primary">
            Starta kursen
            <ChevronRight size={20} />
          </CourseButton>
        </Link>
      </div>
    </main>
  );
}