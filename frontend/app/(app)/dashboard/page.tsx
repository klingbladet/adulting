import RichTextEditor from "@/components/ui/lessons/rich-text-editor";
import { requireUser } from "@/lib/guards";

export default async function DashboardPage() {
  const session = await requireUser();

  return (
      <div className="bg-background text-foreground p-8 min-h-screen">
      <h1>Dashboard</h1>
      <p>Hej {session.user.name}</p>
      <RichTextEditor />
    </div>
  );
}