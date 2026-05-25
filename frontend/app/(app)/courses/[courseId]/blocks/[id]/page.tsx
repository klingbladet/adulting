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
    course = await getCourseById(courseId)
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
    <main className="flex w-full min-h-screen flex-col bg-background -mt-12">
      {/* Header */}
      <div className="flex items-center justify-between md:justify-start p-6 relative z-10 mx-auto max-w-auto min-h-full font-sans text-foreground">
          <header className="h-auto min-h-45 md:min-h-60 w-screen -mx-12 bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-14 pb-6 px-6 relative">
            <div className="flex justify-start items-center md:flex-col md:justify-center md:text-center">
              <div className="flex flex-col gap-4 md:mt-4">

                {previousBlock ? (
                   <Link href={`/courses/${courseId}/blocks/${previousBlock.id}`}>
                    <ArrowLeft
                      size={20}
                      className="text-secondary-foreground"
                    />
                  </Link>
                ) : (
                  <Link href={`/courses/${courseId}/overview`}>
                    <ArrowLeft
                      size={20}
                      className="text-secondary-foreground"
                    />
                  </Link>
                )}
                  
                <div className="flex flex-col items-start justify-end">
                  <p className="text-sm md:text-lg text-muted-foreground leading-tight mt-1 md:max-w-md">
                    {course.title}
                  </p>
                  <p className="text-xl md:text-lg font-semibold leading-tight mt-1 md:max-w-md">
                    {block.title}
                  </p>
                </div>
                <div className="flex justify-start items-start w-100">
                  
                  {/* Progress bar */}
                  <div className="mr-12 h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-button transition-all duration-300"
                      style={{
                      width: `${progress}%`,
                  }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {stepNumber} av {totalBlocks} avklarat
                </span>
              </div>
            </div>
          </header>
        </div>

        {/* Content */}
        <div className="mb-10 flex flex-col p-6">

          <div className="prose prose-slate max-w-none text-lg leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
            <TipTapViewer content={block.content} />
          </div>

          <div className="flex justify-center" />
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
              href={`/courses/${courseId}/summary/${block.id}`}
              courseId={courseId}
              progress={100}
              className="flex-2 rounded-4xl bg-button px-6 py-4 font-semibold text-white transition hover:opacity-90"
            >
              Slutför kurs
            </ProgressLink>
          )}
      </div>

    </main>
  );
}