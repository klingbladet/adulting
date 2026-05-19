import { requireRole } from "@/lib/guards";
import CreatorToolsClient from "@/components/courses/create-content";
// import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
// import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
// import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <CreatorToolsClient />
    </div>
  );
}