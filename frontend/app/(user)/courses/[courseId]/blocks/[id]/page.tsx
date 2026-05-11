import Link from 'next/link';
import CourseButton from '@/components/ui/courses/course-buttons';
import { X } from 'lucide-react';
import { getBlocksByCourseId } from '@/lib/api';

export default async function BlockPage({ params }: { params: Promise<{ courseId: string; id: string }> }) {
  const { courseId, id } = await params;

  let blocks;
  try {
    blocks = await getBlocksByCourseId(courseId);
  } catch {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Steget hittades inte</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Kunde inte hämta block för kursen {courseId}.
        </p>
        <Link href={`/courses/${courseId}/overview`}>
          <CourseButton variant="primary">Gå tillbaka till översikten</CourseButton>
        </Link>
      </main>
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  const totalBlocks = sortedBlocks.length;

  // id i URL:en är block.id från databasen
  const block = sortedBlocks.find((b) => b.id === Number(id));
  const currentIndex = sortedBlocks.findIndex((b) => b.id === Number(id));

  const previousBlock = currentIndex > 0 ? sortedBlocks[currentIndex - 1] : null;
  const nextBlock = currentIndex < totalBlocks - 1 ? sortedBlocks[currentIndex + 1] : null;

  if (!block) {
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

  const stepNumber = currentIndex + 1;

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
            style={{ width: `${(stepNumber / totalBlocks) * 100}%` }}
          />
        </div>

        <span className="text-sm font-medium text-secondary-foreground">
          {stepNumber}/{totalBlocks}
        </span>
      </div>

      {/* Innehållssektion */}
      <div className="flex flex-col mb-10 p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {block.title}
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-foreground leading-relaxed text-lg">
            {typeof block.content === 'string'
              ? block.content
              : JSON.stringify(block.content)}
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
      <div className="p-6 pb-10 border-t border-border flex justify-center gap-4">
        {previousBlock && (
          <Link href={`/courses/${courseId}/blocks/${previousBlock.id}`} className="flex-2">
            <CourseButton variant="primary" fullWidth>
              Tillbaka
            </CourseButton>
          </Link>
        )}

        {nextBlock ? (
          <Link href={`/courses/${courseId}/blocks/${nextBlock.id}`} className="flex-2">
            <CourseButton variant="primary" fullWidth>
              Nästa
            </CourseButton>
          </Link>
        ) : (
          <Link href={`/courses/${courseId}/summary/${block.id}`} className="flex-2">
            <CourseButton variant="primary" fullWidth>
              Slutför kurs
            </CourseButton>
          </Link>
        )}
      </div>
    </main>
  );
}
