import CourseButton from '@/components/courses/course-buttons';
import Link from 'next/link';
import { getCourseById, getBlocksByCourseId } from '@/lib/api';
import { Block } from '@/types/types';
import BlockCard from '@/components/courses/course-layout';

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

// Hjälpfunktion för att extrahera ren text från TipTap JSON
function extractPlainText(content: unknown): string {
  if (!content) return 'Innehåll saknas';
  
  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return content; // Det var redan en vanlig sträng
    }
  }

  function parseNode(node: TipTapNode): string {
    if (!node) return '';
    if (node.type === 'text' && node.text) return node.text;
    if (Array.isArray(node.content)) return node.content.map(parseNode).join(' ');
    return '';
  }

  const text = parseNode(parsed as TipTapNode).replace(/\s+/g, ' ').trim();
  return text || 'Innehåll saknas';
}

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
        {sortedBlocks.map((block, index) => {
          const plainText = extractPlainText(block.content);
          const shortDesc = plainText.length > 40 ? plainText.substring(0, 40) + '...' : plainText;
          
          return (
            <Link key={block.id} href={`/courses/${courseId}/blocks/${block.id}`}>
              <BlockCard
                icon={<span className="font-bold text-lg">{index + 1}</span>}
                title={block.title || `Steg ${index + 1}`}
                description={shortDesc}
              />
            </Link>
          );
        })}

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
