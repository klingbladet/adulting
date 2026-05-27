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
    <main className="flex w-full min-h-screen flex-col bg-background -mt-6 mr-10 relative">
      {/* Header */}
      <header className="md:flex md:justify-start h-auto min-h-45 md:min-h-60 -mx-6 p-16 bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-18 px-6 md:pb-6 relative w-screen text-foreground font-sans z-10">
        <div className="flex justify-start items-center gap-4">
          <div className="flex flex-col gap-4 md:mt-4 px-4 md:px-8 lg:px-16 max-w-5xl relative">
            {previousBlock ? (
              <Link href={`/courses/${courseId}/blocks/${previousBlock.id}`}>
                <ArrowLeft
                  size={20}
                  className="text-secondary-foreground hover:opacity-85 transition-opacity"
                />
              </Link>
            ) : (
              <Link href={`/courses/${courseId}/overview`}>
                <ArrowLeft
                  size={20}
                  className="text-secondary-foreground hover:opacity-85 transition-opacity"
                />
              </Link>
            )}

            <div className="flex flex-col md:justify-start md:items-start md:mt-4 text-left">
              <p className="text-xs sm:text-sm md:text-lg text-muted-foreground leading-tight mt-1 md:max-w-md">
                {course.title}
              </p>
              <p className="text-xl sm:text-xl md:text-3xl font-semibold leading-tight mt-1 md:max-w-md">
                {block.title}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-start justify-end w-full">
              {/* Progress bar */}
              <div className="h-1 w-85 md:w-100 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-button transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stepNumber} av {totalBlocks} avklarat
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mb-6 flex flex-col justify-center items-center pt-6 pl-4">
        <div className="md:flex md:justify-center md:items-start md:text-left prose prose-slate w-90 md:w-200 text-md leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
          <TipTapViewer content={block.content} />
        </div>
      </div>

      {/* Footer navigation */}
      <div className="mb-10 flex justify-center gap-4 border-t border-border p-6 pb-10">

        {nextBlock ? (
          <ProgressLink
            href={`/courses/${courseId}/blocks/${nextBlock.id}`}
            courseId={courseId}
            progress={progress}
            className="flex justify-center items-center text-md rounded-4xl px-6 py-4 font-semibold transition hover:opacity-90 bg-button text-white hover:bg-[#649EF6]"
          >
            Gå vidare till: {nextBlock.title}
          </ProgressLink>
        ) : (
          <ProgressLink
            href={`/courses/${courseId}/quiz?finalBlockId=${block.id}`}
            courseId={courseId}
            progress={100}
            className="flex-2 rounded-4xl bg-button px-6 py-4 font-semibold text-white transition hover:opacity-90"
          >
            Gå till quiz
          </ProgressLink>
        )}
      </div>

    </main>
  );
}