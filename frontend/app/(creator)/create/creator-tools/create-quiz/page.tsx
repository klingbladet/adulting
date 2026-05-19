import { requireRole } from "@/lib/guards";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import CreatorStepper from "@/components/courses/creator-stepper";
import GenerateCourseQuizPanel from "@/components/courses/generate-course-quiz-panel";

type CreatorToolsPageProps = {
  searchParams: Promise<{
    courseId?: string;
  }>;
};

export default async function CreatorToolsPage({
  searchParams,
}: CreatorToolsPageProps) {
  await requireRole(["creator", "admin"]);

  const params = await searchParams;
  const courseId = params.courseId;

  return (
    <>
      <CreatorStepper currentStep={3} />

      <div className="my-6">
        <GenerateCourseQuizPanel courseId={courseId} />
      </div>

      <div className="flex flex-row justify-between">
        <Link href={`/create/creator-tools/create-blocks?courseId=${courseId}`}>
          <CourseButton variant="secondary">Tillbaka</CourseButton>
        </Link>

        <Link href={`/create/creator-tools/preview`}>
          <CourseButton>Nästa</CourseButton>
        </Link>
      </div>
    </>
  );
}