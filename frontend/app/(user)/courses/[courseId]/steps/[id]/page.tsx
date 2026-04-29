import React from 'react';
import Link from 'next/link';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import { X } from 'lucide-react';
import { getStep } from '@/lib/course-data';

export default async function StepPage({ params }: { params: Promise<{ courseId: string, id: string }> }) {
  const { courseId, id } = await params;
  const { step, totalSteps } = getStep(courseId, id);

  const getNextStepPath = () => {
    const currentStep = Number(id);

    if (currentStep >= totalSteps) {
      return `summary/${id}`;
    }
    return `steps/${currentStep + 1}`;
  };

  if (!step) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Steget hittades inte</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Kunde inte hitta steg {id} i kursen {courseId}.
        </p>
        <Link href={`/courses/${courseId}/overview`}>
          <CourseButton variant="primary">Gå tillbaka till översikten</CourseButton>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Header med stäng-knapp och progress */}
      <div className="p-6 flex items-center justify-between">
        <Link href={`/courses/${courseId}/overview`}>
          <X size={24} className="text-secondary-foreground" />
        </Link>

        {/* Enkel progress bar-indikator */}
        <div className="flex-1 mx-8 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(Number(id) / totalSteps) * 100}%` }}
          />
        </div>

        <span className="text-sm font-medium text-secondary-foreground">
          {id}/{totalSteps}
        </span>
      </div>

      {/* Innehållssektion */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {step.title}
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-foreground leading-relaxed text-lg">
            {step.text}
          </p>
        </div>

        {/* Här kan du lägga till bilder, videor eller quiz-element */}
        <div className="flex justify-center">
          <div className="mt-8 w-auto h-50 aspect-video bg-secondary rounded-3xl border-2 border-dashed border-secondary-foreground flex items-center justify-center text-foreground">
            Bild eller Video
          </div>
        </div>
      </div>

      {/* Footer med navigering */}
      <div className="p-6 pb-10 border-t border-gray-50 flex gap-4">
        <Link href={`/courses/${courseId}/overview`} className="flex-1">
          <CourseButton variant="secondary" fullWidth>
            Avbryt
          </CourseButton>
        </Link>

        <Link href={`/courses/${courseId}/${getNextStepPath()}`} className="flex-2">
          <CourseButton variant="primary" fullWidth>
            {Number(id) === totalSteps ? 'Slutför kurs' : 'Nästa steg'}
          </CourseButton>
        </Link>
      </div>
    </main>
  );
}
