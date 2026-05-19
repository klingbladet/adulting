import CreatorStepper from "@/components/courses/creator-stepper"
import CourseButton from "@/components/courses/course-buttons"
import Link from "next/link"
import { getCourseById } from "@/lib/api"

export default async function SummaryPage({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  const resolvedParams = await searchParams;
  const courseId = resolvedParams?.courseId;

  let course = null;
  if (courseId) {
    try {
      course = await getCourseById(courseId);
    } catch (e) {
      console.error(e);
    }
  }

  // Räkna ut antalet steg på ett säkert sätt utifrån datan
  const steps = (course as any)?.courseBlocks?.length || (typeof course?.blocks === 'number' ? course.blocks : 0);

  return(
    <>
      <CreatorStepper currentStep={5} />
      
      <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Sammanfattning av kursen</h1>
        
        {course ? (
          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Titel</span>
              <span className="font-semibold text-gray-800">{course.title}</span>
            </div>
            
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Kategori</span>
              <span className="font-semibold text-gray-800">
                {(course as any).category?.name || "Ingen kategori"}
              </span>
            </div>
            
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Omfattning</span>
              <span className="font-semibold text-gray-800">{steps} block • {course.time} minuter</span>
            </div>
          </div>
        ) : (
          <p className="text-red-500 mb-8 italic">Ingen kurs hittades att publicera. Saknas courseId i URL:en?</p>
        )}

        <div className="flex flex-row justify-between mt-10">
          <Link href={`/create/creator-tools/create-quiz${courseId ? `?courseId=${courseId}` : ''}`}>
            <CourseButton variant="secondary">Tillbaka</CourseButton>
          </Link>
          <Link href="/create/creator-tools">
            <CourseButton>Publicera kurs</CourseButton>
          </Link>
        </div>
      </div>
    </>
  )
}
