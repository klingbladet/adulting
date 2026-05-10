'use client';
import CourseButton from '@/components/ui/lessons/course/course-buttons';
import Link from 'next/link'
import { use } from 'react';
import { getCourse } from '@/lib/course-data';
import { CheckCircle2 } from 'lucide-react';

export default function Personalize({ params }: { params: Promise <{ courseId: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.courseId;
  const course = getCourse(courseId)

  if (!course) {
    return (
      <div className="p-6 text-foreground">
        <h1 className="text-xl font-bold">Kursen hittades inte</h1>
        <p>Kunde inte hitta kursen {courseId}</p>
      </div>
    );
  }
  return(
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">Anpassa kursen till dig</h1>
      <p className="text-sm">Svara på några korta frågor så anpassar vi innehållet. Du kan hoppa över ifall du vill</p>
      <h3 className="text-sm"><strong>Vad är din budget per månad?</strong></h3>
      <div className="flex flex-col gap-3 text-sm">
        {['Under 5 000 kr', '5 000 - 8 000 kr', 'Över 8 000 kr'].map((price) => (
          <label key={price} className="cursor-pointer group">
            <input 
              type="radio" 
              name="price-range" 
              className="peer sr-only" 
              value={price}
            />
            <div className="flex items-center justify-between p-3 border-2 border-border rounded-xl transition-all
                          peer-checked:border-primary peer-checked:bg-secondary
                          group-hover:border-ring">
              
              <p className="font-medium text-foreground peer-checked:text-secondary-foreground">
                {price}
              </p>
              <CheckCircle2 
                className="w-5 h-5 text-primary opacity-0 transition-opacity peer-checked:opacity-100" 
              />
            </div>
          </label>
        ))}
      </div>
      <h3 className="text-sm"><strong>Hur mycket vet du om att hyra bostad?</strong></h3>
      <div className="flex flex-col gap-3 text-sm">
        {['Helt ny - vet inte var jag ska börja', 'Lite grann - har kollat men osäker', 'Ganska bra - behöver kolla av'].map((level) => (
          <label key={level} className="cursor-pointer group">
            <input 
              type="radio" 
              name="level-range" 
              className="peer sr-only" 
              value={level}
            />
            <div className="flex items-center justify-between p-3 border-2 border-border rounded-xl transition-all
                          peer-checked:border-primary peer-checked:bg-secondary
                          group-hover:border-ring">
              
              <p className="font-medium text-foreground peer-checked:text-secondary-foreground">
                {level}
              </p>
              <CheckCircle2 
                className="w-5 h-5 text-primary opacity-0 transition-opacity peer-checked:opacity-100" 
              />
            </div>
          </label>
        ))}
      </div>
      <Link href={`/courses/${courseId}/overview`}>
        <CourseButton>
          Spara och fortsätt till kurs
        </CourseButton>
      </Link>
    </div>
  )
}