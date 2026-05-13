import Link from 'next/link';
import CourseButton from '@/components/courses/course-buttons';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';

export default async function SummaryPage({ params }: { params: Promise<{ courseId: string; id: string }> }) {
  const { courseId, id } = await params;

  let course;
  let blocks;

  try {
    [course, blocks] = await Promise.all([
      getCourseById(courseId),
      getBlocksByCourseId(courseId),
    ]);
  } catch {
    return <div>Kunde inte hämta kursdata</div>;
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  const block = sortedBlocks.find((b) => b.id === Number(id));
  const isLastBlock = sortedBlocks[sortedBlocks.length - 1]?.id === Number(id);

  if (!block) {
    return <div>Steg hittades inte</div>;
  }

  return (
    <main className="flex flex-col min-h-screen bg-background p-6 text-center">

      <div className="mb-8">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-primary font-bold">✓</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Snyggt jobbat!</h1>
        <p className="text-muted-foreground text-lg">
          Du har slutfört: {block.title}
        </p>
        {isLastBlock && course && (
          <p className="text-muted-foreground mt-2">
            Du har nu gått igenom hela kursen: <strong>{course.title}</strong>
          </p>
        )}
      </div>

      <div className="w-full space-y-4">
        <Link href={`/courses/${courseId}/overview`} className="block">
          <CourseButton variant="primary">
            Tillbaka till översikt
          </CourseButton>
        </Link>
      </div>
    </main>
  );
}
