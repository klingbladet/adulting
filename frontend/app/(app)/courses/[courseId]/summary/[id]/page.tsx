import Link from 'next/link';
import CourseButton from '@/components/courses/course-buttons';
import { getCourseById, getBlocksByCourseId, getCategories, Category } from '@/lib/api';

import BasicRating from '@/components/courses/StarsRating';
import CategoryButtons from '@/components/courses/category-buttons';

export default async function SummaryPage({ params }: { params: Promise<{ courseId: string; id: string }> }) {

  const { courseId, id } = await params;

  let course;
  let blocks;
  let categories: Category[] = [];

  try {
    [course, blocks, categories] = await Promise.all([
      getCourseById(courseId),
      getBlocksByCourseId(courseId),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Kunde inte hämta kursdata", error)
    console.log(categories);
    return <div>Kunde inte hämta kursdata</div>;
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  const block = sortedBlocks.find((b) => b.id === Number(id));
  const isLastBlock = sortedBlocks[sortedBlocks.length - 1]?.id === Number(id);

  if (!block) {
    return <div>Steg hittades inte</div>;
  }

  return (
    <main className="bg-background text-center -m-6"
      style={{
        backgroundImage: "url('/images/backgrounds/fyrverkerier.gif')",
        backgroundSize: "contain",
        backgroundPosition: "start",
        backgroundRepeat: "no-repeat"
      }}>
      <section className="mt-10 flex flex-col p-6 justify-around min-h-screen">
        <div className="flex flex-col justify-center gap-4">
          <h1 className="text-7xl font-bold text-summary">Grattis!</h1>
          <div className="flex flex-col justify-center gap-2">
            {isLastBlock && course && (
              <span className="flex gap-1 justify-center flex-wrap text-summary font-normal">
                Du har läst igenom sista blocket: <p className='font-semibold'>{block.title}</p>
              </span>
            )}
            <span className="flex justify-center flex-wrap gap-1 text-summary font-normal text-lg">
              Du har slutfört kursen: <p className='font-semibold'>{course.title}</p>
            </span>
          </div>
        </div>

        <BasicRating />

        <div className="w-full space-y-4">
          <div className='flex flex-col items-start pb-10 pl-4'>
            <p className="font-medium text-muted-foreground">Vill du fortsätta din resa?</p>
            <CategoryButtons categories={categories} />
          </div>
          <Link href={`/learn`} className="block">
            <CourseButton variant="primary">
              Utforska fler kurser
            </CourseButton>
          </Link>
        </div>
      </section>
    </main >
  );
}
