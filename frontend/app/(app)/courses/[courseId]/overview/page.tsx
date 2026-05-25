import CourseButton from '@/components/courses/course-buttons';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';
import { Block } from '@/types/types';
import BlockCard from '@/components/courses/course-layout';
import CoursePriorityBadge from '@/components/courses/course-priority-badge';

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
    <>
      <h1 className="mb-10 mt-10 text-center text-4xl">{course.title}</h1>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-4 bg-background">
        {personalization?.latestAttempt && (
          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Ditt quizresultat
            </p>

            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {personalization.latestAttempt.score} av{' '}
              {personalization.latestAttempt.maxScore} rätt
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Vi har markerat vilka steg du bör fokusera extra på.
            </p>

            <Link href={`/courses/${courseId}/quiz`} className="mt-4 inline-block">
              <CourseButton variant="secondary">
                Gör om quiz
              </CourseButton>
            </Link>
          </section>
        )}

        {blocksError && (
          <p className="mb-4 text-sm text-red-500">
            Fel vid hämtning av block: {blocksError}
          </p>
        )}

        {sortedBlocks.map((block, index) => {
          const plainText = extractPlainText(block.content);
          const shortDesc =
            plainText.length > 40 ? plainText.substring(0, 40) + '...' : plainText;

          const priority = prioritiesByBlockId.get(block.id);

          return (
            <Link key={block.id} href={`/courses/${courseId}/blocks/${block.id}`}>
              <div className="space-y-2">
                <BlockCard
                  icon={<span className="text-lg font-bold">{index + 1}</span>}
                  title={block.title || `Steg ${index + 1}`}
                  description={shortDesc}
                />

                {priority && (
                  <div className="px-2">
                    <CoursePriorityBadge
                      priority={priority.priority}
                      label={priority.label}
                    />
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {sortedBlocks.length > 0 && (
          <Link href={`/courses/${courseId}/blocks/${sortedBlocks[0].id}`}>
            <CourseButton className="mt-5 mb-20" variant="primary">
              Starta kursen
            </CourseButton>
          </Link>
        )}
      </div>
    </>
  );
}