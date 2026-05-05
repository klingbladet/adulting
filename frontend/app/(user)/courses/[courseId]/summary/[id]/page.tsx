import Link from 'next/link';
import CourseButton from '@/components/ui/courses/course-buttons';
import { getBlock, getCourse } from '@/lib/course-data';

export default async function SummaryPage({ params }: { params: Promise<{ courseId: string, id: string }> }) {
  const { courseId, id } = await params;
  const { step } = getBlock(courseId, id);
  const course = getCourse(courseId);
  const totalSteps = course?.totalBlocks ?? 0;
  const isLastStep = Number(id) >= totalSteps;

  if (!step) {
    return <div>Steg hittades inte</div>;
  }

  const nextStepPath = isLastStep 
    ? `/courses/${courseId}/overview` 
    : `/courses/${courseId}/steps/${Number(id) + 1}`;

  return (
    <main className="flex flex-col min-h-screen bg-background p-6 text-center">
      
      <div className="mb-8">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-primary font-bold">✓</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Snyggt jobbat!</h1>
        <p className="text-muted-foreground text-lg">
          Du har slutfört: {step.title}
        </p>
      </div>

      <div className="w-full space-y-4">
        <Link href={nextStepPath} className="block">
          <CourseButton variant="primary">
            {isLastStep ? 'Tillbaka till översikt' : 'Nästa steg'}
          </CourseButton>
        </Link>
        
        {!isLastStep && (
          <Link href={`/courses/${courseId}/overview`} className="block">
            <CourseButton variant="secondary">Tillbaka till kursöversikt</CourseButton>
          </Link>
        )}
      </div>
    </main>
  );
}
