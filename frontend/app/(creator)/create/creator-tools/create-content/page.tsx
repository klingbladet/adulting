import { requireRole } from "@/lib/guards";
import CreatorToolsClient from "@/components/courses/create-content";
import StepNavigation from "@/components/courses/step-navigation";
// import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
// import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
// import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans md:pr-20">
      <CreatorToolsClient />
      <StepNavigation
        backPath="/create/creator-tools/create-blocks"
        nextPath="/create/creator-tools/create-quiz"
      />
    </div>
  );
}