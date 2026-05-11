import { requireRole } from "@/lib/guards";
import RichTextEditor from "@/components/ui/lessons/rich-text-editor";
import GenerateQuizPanel from "@/components/learning/generate-quiz-panel";
import { BlockPriorityDemoPanel } from "@/components/learning/block-priority-demo-panel";
import { LearningDemoPanel } from "@/components/learning/learning-demo-panel";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Skapa en kurs</h1>
      <RichTextEditor />
      
      <LearningDemoPanel />

    </div>
  );
}