import { requireRole } from "@/lib/guards";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import CreatorStepper from "@/components/courses/creator-stepper";

export default async function CreatorToolsPage() {
  
  await requireRole(["creator", "admin"]);

  return (
    <>
      <CreatorStepper currentStep={3} />
      <div className="flex flex-row justify-between">
          <Link href={`/create/creator-tools/create-content`}>
            <CourseButton variant="secondary">Tillbaka</CourseButton>
          </Link>
          <Link href={`/create/creator-tools/preview`}>
            <CourseButton>Nästa</CourseButton>
          </Link>
      </div>
    </>
  );
}