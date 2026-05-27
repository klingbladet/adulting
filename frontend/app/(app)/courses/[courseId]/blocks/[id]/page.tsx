import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { ArrowLeft } from "lucide-react";
import { getBlocksByCourseId, getCourseById } from "@/lib/api";
import TipTapViewer from "@/components/courses/tiptap-viewer";
import ProgressLink from "@/components/courses/progress-link";

export default async function BlockPage({
  params,
}: {
  params: Promise<{ courseId: string; id: string }>;
}) {
  const { courseId, id } = await params;

  let blocks;
  let course;

  try {
    blocks = await getBlocksByCourseId(courseId);
    course = await getCourseById(courseId);
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

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  const totalBlocks = sortedBlocks.length;

  const block = sortedBlocks.find((b) => b.id === Number(id));

  const currentIndex = sortedBlocks.findIndex((b) => b.id === Number(id));

  const previousBlock =
    currentIndex > 0 ? sortedBlocks[currentIndex - 1] : null;

  const nextBlock =
    currentIndex < totalBlocks - 1 ? sortedBlocks[currentIndex + 1] : null;

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

  const progress = totalBlocks > 0 ? (stepNumber / totalBlocks) * 100 : 0;

  const backHref = previousBlock
    ? `/courses/${courseId}/blocks/${previousBlock.id}`
    : `/courses/${courseId}/overview`;

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-background -mt-6">
      {/* Header */}
      <header className="relative left-1/2 w-screen -translate-x-1/2 bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)]">
  <div className="mx-auto flex min-h-44 max-w-5xl flex-col justify-center px-6 py-8 md:min-h-52 md:px-8 md:py-10">
    <Link href={backHref} className="mb-8 w-fit">
      <ArrowLeft
        size={22}
        className="text-secondary-foreground"
      />
    </Link>

    <div className="flex flex-col items-start">
      <p className="text-sm md:text-base text-muted-foreground leading-tight">
        {course.title}
      </p>

      <h1 className="mt-1 text-2xl md:text-3xl font-semibold leading-tight text-foreground">
        {block.title}
      </h1>

      <div className="mt-6 w-full max-w-md md:max-w-xl">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-button transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span className="mt-3 block text-sm font-medium text-muted-foreground">
          {stepNumber} av {totalBlocks} avklarat
        </span>
      </div>
    </div>
  </div>
</header>

      {/* Content */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 md:px-8 md:py-12">
        <div className="prose prose-slate w-full max-w-none text-md leading-relaxed text-foreground dark:prose-invert [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
          <TipTapViewer content={block.content} />
        </div>
      </section>

      {/* Footer navigation */}
      <footer className="mx-auto w-full max-w-5xl border-t border-border px-6 py-6 md:px-8">
        <div className="flex justify-center">
          {nextBlock ? (
            <ProgressLink
              href={`/courses/${courseId}/blocks/${nextBlock.id}`}
              courseId={courseId}
              progress={progress}
              className="flex items-center justify-center rounded-4xl bg-button px-6 py-4 text-md font-semibold text-white transition hover:bg-[#649EF6] hover:opacity-90"
            >
              Gå vidare till: {nextBlock.title}
            </ProgressLink>
          ) : (
            <ProgressLink
              href={`/courses/${courseId}/quiz?finalBlockId=${block.id}`}
              courseId={courseId}
              progress={100}
              className="flex items-center justify-center rounded-4xl bg-button px-6 py-4 text-md font-semibold text-white transition hover:opacity-90"
            >
              Gå till quiz
            </ProgressLink>
          )}
        </div>
      </footer>
    </main>
  );
}