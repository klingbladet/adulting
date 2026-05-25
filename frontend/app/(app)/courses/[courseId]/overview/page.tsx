import CourseButton from '@/components/courses/course-buttons';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';
import { Block } from '@/types/types';
import BlockCard from '@/components/courses/course-layout';
import CoursePriorityBadge from '@/components/courses/course-priority-badge';
import { ArrowLeft } from 'lucide-react';

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

type BlockPriority = {
  blockId: number;
  blockTitle?: string;
  correctCount: number;
  incorrectCount: number;
  priority: 'high' | 'medium' | 'low';
  label: string;
};

type CoursePersonalization = {
  courseId: number;
  latestAttempt: {
    id: string;
    quizId: number;
    score: number;
    maxScore: number;
    completedAt: string;
  } | null;
  blockPriorities: BlockPriority[];
};

function extractPlainText(content: unknown): string {
  if (!content) return 'Innehåll saknas';

  let parsed = content;

  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch {
      return content;
    }
  }

  function parseNode(node: TipTapNode): string {
    if (!node) return '';
    if (node.type === 'text' && node.text) return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map(parseNode).join(' ');
    }
    return '';
  }

  const text = parseNode(parsed as TipTapNode).replace(/\s+/g, ' ').trim();
  return text || 'Innehåll saknas';
}

async function getCoursePersonalization(
  courseId: string,
): Promise<CoursePersonalization | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const backendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3001';

  try {
    const response = await fetch(
      `${backendUrl}/api/learning/courses/${courseId}/personalization`,
      {
        method: 'GET',
        headers: {
          cookie: cookieHeader,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      console.error('getCoursePersonalization failed:', {
        status: response.status,
        body: await response.text(),
      });

      return null;
    }

    return response.json();
  } catch (error) {
    console.error('getCoursePersonalization crashed:', error);
    return null;
  }
}

export default async function CourseOverview({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const course = await getCourseById(courseId, {
    headers: { cookie: cookieHeader }
  }).catch((err) => {
    console.error('getCourseById failed:', err);
    return null;
  });

  if (!course) {
    return (
      <div className="text-foreground">
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
    blocks = await getBlocksByCourseId(courseId, {
      headers: { cookie: cookieHeader }
    });
  } catch (err) {
    console.error('getBlocksByCourseId failed:', err);
    blocksError = err instanceof Error ? err.message : String(err);
  }

  const personalization = await getCoursePersonalization(courseId);
  console.log("overview personalization:", personalization);
  const prioritiesByBlockId = new Map(
    personalization?.blockPriorities.map((priority) => [
      priority.blockId,
      priority,
    ]) ?? [],
  );

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="relative w-full min-h-screen bg-background -mt-6">
      <div className="relative z-10 mx-auto max-w-auto min-h-full font-sans text-foreground">

        {/* Header Section */}
        <header className="md:flex md:justify-start  h-auto min-h-45 md:min-h-60 w-screen -mx-6 p-16 bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-18 px-6 md:pb-6 relative">
          <div className="flex justify-start items-center gap-4">
            <div className="flex flex-col gap-4 md:mt-4 px-4 md:px-8 lg:px-16 max-w-5xl relative">
              <Link href={`/learn`}>
                <ArrowLeft
                  size={20}
                  className="text-secondary-foreground"
                />
              </Link>
              <div className="flex flex-col md:justify-start md:items-start md:mt-4">
                <p className="text-xs sm:text-sm md:text-lg text-muted-foreground leading-tight mt-1 md:max-w-md">
                  {course.category?.name}
                </p>
                <p className="text-xl sm:text-xl md:text-3xl font-semibold leading-tight mt-1 md:max-w-md">
                  {course.title}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col bg-background p-6">
          <div className="my-5">
            <h3 className="text-lg md:text-2xl font-semibold">
              Introduktion:
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {course.textContent}
            </p>
          </div>
          {personalization?.latestAttempt && (
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Ditt quizresultat
              </p>

              <h2 className="mt-1 text-md font-semibold text-foreground">
                {personalization.latestAttempt.score} av{' '}
                {personalization.latestAttempt.maxScore} rätt
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Vi har markerat vilka steg du bör fokusera extra på.
              </p>

              <Link href={`/courses/${courseId}/quiz`} className="mt-4 inline-block">
                <CourseButton variant="third" className='flex text-sm font-medium px-4! py-2! bg-button text-white'>
                  Gör om quiz
                </CourseButton>
              </Link>
            </section>
          )}


          <div className='flex flex-col gap-4'>
            <p className="mt-4 font-semibold text-lg">
              Vad du kommer lära dig:
            </p>

            {blocksError && (
              <p className="mb-4 text-sm text-red-500">
                Fel vid hämtning av block: {blocksError}
              </p>
            )}
            <div className="">
              {sortedBlocks.map((block, index) => {
                const plainText = extractPlainText(block.content);
                const shortDesc =
                  plainText.length > 40 ? plainText.substring(0, 40) + '...' : plainText;

                const priority = prioritiesByBlockId.get(block.id);

                const isFirst = index === 0;
                const isLast = index === sortedBlocks.length - 1;

                return (
                  <Link key={block.id} href={`/courses/${courseId}/blocks/${block.id}`}>
                    <div className="space-y-2">
                      <div className="flex flex-col items-start bg-bland-foreground rounded-2xl">
                        <BlockCard
                          className={`
                            ${isFirst ? 'rounded-t-2xl' : 'rounded-t-none'}
                            ${isLast ? 'rounded-b-2xl' : 'rounded-b-none'}`
                          }
                          variant='secondary'
                          icon={<span className="font-semibold text-xs">{index + 1}</span>}
                          title={block.title || `Steg ${index + 1}`}
                          description={shortDesc}
                          badge={priority ? <CoursePriorityBadge priority={priority.priority} label={priority.label} /> : undefined}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          {sortedBlocks.length > 0 && (
            <Link href={`/courses/${courseId}/blocks/${sortedBlocks[0].id}`}>
              <CourseButton className="mt-10 mb-20 transition duration-300" variant="third">
                Starta kursen
              </CourseButton>
            </Link>
          )}
        
        </div>
      </div>
    </div>
  );
}