import { requireRole } from "@/lib/guards";
import CreateBlocks from "@/components/courses/create-blocks";
// import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
// import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
// import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <CreateBlocks />
    </div>
  );
}