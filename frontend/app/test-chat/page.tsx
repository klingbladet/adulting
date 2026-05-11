import LearningDemoPanel from "@/components/learning/learning-demo-panel";
import LearningAssistantDemoPanel from "@/components/learning/learning-assistant-demo-panel";

export default function LearningDemoPage() {
  return (
    <main className="min-h-screen space-y-6 bg-background p-6">
      <LearningDemoPanel />
      <LearningAssistantDemoPanel />
    </main>
  );
}