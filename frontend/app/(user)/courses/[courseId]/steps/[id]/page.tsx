import React from 'react';
import Link from 'next/link';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import { X } from 'lucide-react';

// Denna data skulle i verkligheten ligga i en data-fil eller databas
const stepContent: Record<string, { title: string; text: string }> = {
  "1": {
    title: "Förstå marknaden",
    text: "Att förstå bostadsmarknaden är det första steget till din nya bostad. Här går vi igenom skillnaden mellan förstahand, andrahand och hur kösystem fungerar i Sverige."
  },
  "2": {
    title: "Sök bostad",
    text: "Nu är det dags att börja leta! Vi tittar på de största plattformarna och hur du skapar en profil som sticker ut."
  }
};

export default function StepPage({ params }: { params: { courseId: string, id: string } }) {
  const { courseId, id } = params;
  const content = stepContent[id] || { title: "Steg", text: "Innehåll saknas" };

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Header med stäng-knapp och progress */}
      <div className="p-6 flex items-center justify-between">
        <Link href={`/courses/${courseId}/course-map`}>
          <X size={24} className="text-secondary-foreground" />
        </Link>
        
        {/* Enkel progress bar-indikator */}
        <div className="flex-1 mx-8 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-300" 
            style={{ width: `${(Number(id) / 6) * 100}%` }} // Exempel: 6 steg totalt
          />
        </div>

        <span className="text-sm font-medium text-secondary-foreground">
          {id}/6
        </span>
      </div>

      {/* Innehållssektion */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {content.title}
        </h1>
        
        <div className="prose prose-slate">
          <p className="text-foreground leading-relaxed text-lg">
            {content.text}
          </p>
        </div>

        {/* Här kan du lägga till bilder, videor eller quiz-element */}
        <div className="mt-8 w-full aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-secondary-foreground flex items-center justify-center text-fore">
           Bild eller Video
        </div>
      </div>

      {/* Footer med navigering */}
      <div className="p-6 pb-10 border-t border-gray-50 flex gap-4">
        <Link href={`/courses/${courseId}/course-map`} className="flex-1">
          <CourseButton variant="secondary" fullWidth>
            Avbryt
          </CourseButton>
        </Link>

        <Link href={`/courses/${courseId}/summary/${id}`} className="flex-[2]">
          <CourseButton variant="primary" fullWidth>
            Nästa steg
          </CourseButton>
        </Link>
      </div>
    </main>
  );
}