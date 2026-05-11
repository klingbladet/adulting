import StepCard from '@/components/ui/courses/course-layout';
import CourseButton from '@/components/ui/courses/course-buttons';
import Link from 'next/link';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';

export default async function CourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  let course;
  let blocks;

  try {
    [course, blocks] = await Promise.all([
      getCourseById(courseId),
      getBlocksByCourseId(courseId),
    ]);
  } catch {
    return (
      <div className="p-6 text-foreground">
        <h1 className="text-xl font-bold">Kursen hittades inte</h1>
        <p>Kunde inte hitta kursen {courseId}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-foreground">
        <h1 className="text-xl font-bold">Kursen hittades inte</h1>
        <p>Kunde inte hitta kursen {courseId}</p>
      </div>
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <>
      <h1 className="text-center mb-10 text-4xl">{course.title}</h1>
      <div className="flex flex-col gap-4 p-6 bg-background min-h-screen">
        {sortedBlocks.map((block, index) => (
          <Link key={block.id} href={`/courses/${courseId}/blocks/${block.id}`}>
            <StepCard
              icon={<span className="font-bold text-lg">{index + 1}</span>}
              title={block.title || `Steg ${index + 1}`}
              description={
                typeof block.content === 'string'
                  ? block.content.substring(0, 40) + '...'
                  : block.content
                  ? JSON.stringify(block.content).substring(0, 40) + '...'
                  : 'Innehåll saknas'
              }
            />
          </Link>
        ))}

        {sortedBlocks.length > 0 && (
          <Link href={`/courses/${courseId}/blocks/${sortedBlocks[0].id}`}>
            <CourseButton className="mt-10" variant="primary">
              Starta kursen
            </CourseButton>
          </Link>
        )}
      </div>
    </>
  );
}
