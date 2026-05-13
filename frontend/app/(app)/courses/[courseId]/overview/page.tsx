import CourseButton from '@/components/ui/courses/course-buttons';
import Link from 'next/link';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';
import { Block } from '@/app/types/types';
import BlockCard from '@/components/ui/courses/course-layout';

export default async function CourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = await getCourseById(courseId).catch((err) => {
    console.error('getCourseById failed:', err);
    return null;
  });

  if (!course) {
    return (
      <div className="p-6 text-foreground">
        <h1 className="text-xl font-bold">Kursen hittades inte</h1>
        <p>Kunde inte hitta kursen med ID: {courseId}</p>
        <Link href="/courses" className="mt-4 inline-block text-primary underline">
          Tillbaka till alla kurser
        </Link>
      </div>
    );
  }

  let blocks: Block[] = [];
  let blocksError: string | null = null;

  try {
    blocks = await getBlocksByCourseId(courseId);
  } catch (err) {
    console.error('getBlocksByCourseId failed:', err);
    blocksError = err instanceof Error ? err.message : String(err);
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <>
      <h1 className="text-center mb-10 text-4xl">{course.title}</h1>
      <div className="flex flex-col gap-4 p-6 bg-background min-h-screen relative mx-auto max-w-5xl">
        {blocksError && (
          <p className="text-red-500 text-sm mb-4">Fel vid hämtning av block: {blocksError}</p>
        )}
        {sortedBlocks.map((block, index) => (
          <Link key={block.id} href={`/courses/${courseId}/blocks/${block.id}`}>
            <BlockCard
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
