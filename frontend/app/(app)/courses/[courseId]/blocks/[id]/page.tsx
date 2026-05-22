import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { X } from "lucide-react";
import { getBlocksByCourseId } from "@/lib/api";
import TipTapViewer from "@/components/courses/tiptap-viewer";
import ProgressLink from "@/components/courses/progress-link";

export default async function BlockPage({
  params,
}: {
  params: Promise<{ courseId: string; id: string }>;
}) {
  const { courseId, id } = await params;

  let blocks;

  try {
    blocks = await getBlocksByCourseId(courseId);
  } catch {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Steget hittades inte
        </h1>

        <p className="mb-6 text-center text-muted-foreground">
          Kunde inte hämta block för kursen {courseId}.
        </p>

        <Link href={`/courses/${courseId}/overview`}>
          <CourseButton variant="primary">
            Gå tillbaka till översikten
          </CourseButton>
        </Link>
      </main>
    );
  }

  const sortedBlocks = [...blocks].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const totalBlocks = sortedBlocks.length;

  const block = sortedBlocks.find((b) => b.id === Number(id));

  const currentIndex = sortedBlocks.findIndex(
    (b) => b.id === Number(id)
  );

  const previousBlock =
    currentIndex > 0 ? sortedBlocks[currentIndex - 1] : null;

  const nextBlock =
    currentIndex < totalBlocks - 1
      ? sortedBlocks[currentIndex + 1]
      : null;

  if (!block) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Steget hittades inte
        </h1>

        <p className="mb-6 text-center text-muted-foreground">
          Kunde inte hitta steg {id} i kursen {courseId}.
        </p>

        <Link href={`/courses/${courseId}/overview`}>
          <CourseButton variant="primary">
            Gå tillbaka till översikten
          </CourseButton>
        </Link>
      </main>
    );
  }

  const stepNumber = currentIndex + 1;

  const progress =
    totalBlocks > 0
      ? (stepNumber / totalBlocks) * 100
      : 0;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href={`/courses/${courseId}/overview`}>
          <X
            size={24}
            className="text-secondary-foreground"
          />
        </Link>

        {/* Progress bar */}
        <div className="mx-8 h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span className="text-sm font-medium text-secondary-foreground">
          {stepNumber}/{totalBlocks}
        </span>
      </div>

      {/* Content */}
      <div className="mb-10 flex flex-col p-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {block.title}
        </h1>

        <div className="prose prose-slate max-w-none text-lg leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
          <TipTapViewer content={block.content} />
        </div>

        <div className="flex justify-center" />
      </div>

      {/* Footer navigation */}
      <div className="flex justify-center gap-4 border-t border-border p-6 pb-10">
        {previousBlock && (
          <Link
            href={`/courses/${courseId}/blocks/${previousBlock.id}`}
            className="flex-2"
          >
            <CourseButton
              variant="primary"
              fullWidth
            >
              Tillbaka
            </CourseButton>
          </Link>
        )}

        {nextBlock ? (
          <ProgressLink
            href={`/courses/${courseId}/blocks/${nextBlock.id}`}
            courseId={courseId}
            progress={progress}
            className="flex-2"
          >
            <CourseButton
              variant="primary"
              fullWidth
            >
              Nästa
            </CourseButton>
          </ProgressLink>
        ) : (
          <ProgressLink
            href={`/courses/${courseId}/summary/${block.id}`}
            courseId={courseId}
            progress={100}
            className="flex-2"
          >
            <CourseButton
              variant="primary"
              fullWidth
            >
              Slutför kurs
            </CourseButton>
          </ProgressLink>
        )}
      </div>
    </main>
  );
}