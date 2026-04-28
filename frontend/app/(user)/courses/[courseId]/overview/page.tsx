'use client';
import StepCard from '@/components/ui/lessons/course/course-layout';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import Link from 'next/link'

export default function CourseOverview({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  
  return (
    <div className="flex flex-col gap-3 p-6 bg-background min-h-screen">
      <Link href={`/courses/${courseId}/steps/1`}>
        <StepCard 
          icon={<span className="font-bold text-lg">1</span>}
          title="Förstå marknaden"
          description="Förstahand, andrahand, kötid"
          onClick={() => console.log("Går till modul 1")}
        />
      </Link>

      <StepCard 
        icon={<span className="font-bold text-lg">2</span>}
        title="Sök bostad"
        description="Blocket, kommunala bolag, FB"
        onClick={() => console.log("Går till modul 2")}
      />

      <StepCard 
        icon={<span className="font-bold text-lg">3</span>}
        title="Läs kontraktet"
        description="Vad ska finnas med?"
        onClick={() => console.log("Går till modul 3")}
      />

      <StepCard 
        icon={<span className="font-bold text-lg">4</span>}
        title="Läs kontraktet"
        description="Vad ska finnas med?"
        onClick={() => console.log("Går till modul 4")}
      />

      <StepCard 
        icon={<span className="font-bold text-lg">5</span>}
        title="Förstå kostnaderna"
        description="Hyra, deposition, el"
        onClick={() => console.log("Går till modul 5")}
      />

      <StepCard 
        icon={<span className="font-bold text-lg">6</span>}
        title="Flytta in"
        description="Besiktning, nycklar, folkbokföring"
        onClick={() => console.log("Går till modul 6")}
      />

      <CourseButton className="mt-10" variant="primary">
        Gå till personalisering
      </CourseButton>
    </div>
  );
}