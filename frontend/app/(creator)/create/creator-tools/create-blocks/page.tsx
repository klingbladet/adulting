import { requireRole } from "@/lib/guards";
import CreateBlocks from "@/components/courses/create-blocks";
// import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
// import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
// import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans mb-10 md:pr-20">
      <CreateBlocks />
    </div>
  );
}