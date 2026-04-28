import React from 'react';
import Link from 'next/link';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import { ChevronRight, Home } from 'lucide-react';

const courseData: Record<string, { title: string; subtitle: string }> = {
  "hitta-bostad": {
    title: "Hitta din första bostad",
    subtitle: "Vi hjälper dig genom hela processen, från sökande till kontrakt."
  },
  "ekonomi-for-alla": {
    title: "Grundläggande ekonomi",
    subtitle: "Lär dig hantera din budget och spara smartare."
  }
};

export default function CourseStartPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const course = courseData[courseId] || { title: "Hitta och hyra din första bostad", subtitle: "En steg-för-steg-kurs som guidar dig genom hela processen att hyra bostad i Sverige." };

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Övre sektion med illustration/ikon */}
      <div className="flex flex-col items-center p-8 text-center">
        
        {/* Placeholder för din illustration (den stora blå cirkeln med huset) */}
        <div className="w-64 h-64 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative">
          <div className="bg-white p-6 rounded-3xl shadow-xl ">
             <Home size={80} className="text-[#5D7CFA]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
          {course.title}
        </h1>
        
        <p className="text-secondary text-lg max-w-sm">
          {course.subtitle}
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <div className="bg-red-300 p-1 rounded-sm">
          25 min
        </div>
        <div className="bg-green-300 p-1 rounded-sm">
          Nybörjare
        </div>
        <div className="bg-blue-300 p-1 rounded-sm">
          6 steg
        </div>
      </div>

      {/* Nedre sektion med knapp */}
      <div className="p-6 pb-12 mt-10">
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