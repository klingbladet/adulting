import { requireRole } from "@/lib/guards";
import CreatorToolsClient from "@/components/courses/create-content";
import StepNavigation from "@/components/courses/step-navigation";
// import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
// import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
// import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-background font-sans text-foreground pb-28 md:max-w-5xl md:mx-auto md:px-8 md:py-14 px-5 pt-6">
      <CreatorToolsClient />
      <StepNavigation
        backPath="/create/creator-tools/create-blocks"
        nextPath="/create/creator-tools/create-quiz"
      />
    </div>
  );
}