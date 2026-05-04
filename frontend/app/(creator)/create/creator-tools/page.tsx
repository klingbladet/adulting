import { requireRole } from "@/lib/guards";
import RichTextEditor from "@/components/ui/lessons/rich-text-editor";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Skapa en kurs</h1>
      <RichTextEditor />
    </div>
  );
}