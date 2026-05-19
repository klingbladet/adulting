import { requireRole } from "@/lib/guards";
import CreatorStepper from "@/components/courses/creator-stepper";
import StepNavigation from "@/components/courses/step-navigation";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <>
      <CreatorStepper currentStep={3} />
      
      {/* Resten av quiz-innehållet kommer här... */}

      <StepNavigation 
        backPath="/create/creator-tools/create-content"
        nextPath="/create/creator-tools/preview"
      />
    </>
  );
}