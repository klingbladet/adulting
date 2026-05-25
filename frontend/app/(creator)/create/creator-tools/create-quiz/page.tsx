import { requireRole } from "@/lib/guards";
import CreatorStepper from "@/components/courses/creator-stepper";
import StepNavigation from "@/components/courses/step-navigation";
import GenerateCourseQuizPanel from "@/components/courses/generate-course-quiz-panel";

  type CreatorToolsPageProps = {
    searchParams: Promise<{
      courseId?: string;
    }>;
  }
  
export default async function CreatorToolsPage({
  searchParams,
}: CreatorToolsPageProps) {
  await requireRole(["creator", "admin"]);
  
  const params = await searchParams;
  const courseId = params.courseId;

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-background font-sans text-foreground pb-28 md:max-w-5xl md:mx-auto md:px-8 md:py-14 px-5 pt-6">
      <CreatorStepper currentStep={3} />
      
      {/* Resten av quiz-innehållet kommer här... */}

      <div className="my-6">
        <GenerateCourseQuizPanel courseId={courseId} />
      </div>
      <StepNavigation 
        backPath="/create/creator-tools/create-content"
        nextPath="/create/creator-tools/preview"
      />
    </div>
  );
}