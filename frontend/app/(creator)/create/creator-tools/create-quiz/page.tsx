import { requireRole } from "@/lib/guards";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import CreatorStepper from "@/components/courses/creator-stepper";
// import { getCourseById } from "@/lib/api";

export default async function CreatorToolsPage() {

  // const resolvedParams = await searchParams;
  // const courseId = resolvedParams?.courseId;
  
  await requireRole(["creator", "admin"]);

  return (
    <>
      <CreatorStepper currentStep={3} />
      <div className="flex flex-row justify-between">
          <Link href={`/create/creator-tools/create-content`}>
            <CourseButton variant="secondary">Tillbaka</CourseButton>
          </Link>
          {/* <Link href={`/create/creator-tools/preview${courseId}`}> */}
            <CourseButton>Nästa</CourseButton>
          </Link>
      </div>
    </>
  );
}