import { Suspense } from "react";
import { requireRole } from "@/lib/guards";
import CreateBlocks from "@/components/courses/create-blocks";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans mb-10 md:pr-20">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Laddar...</div>}>
        <CreateBlocks />
      </Suspense>
    </div>
  );
}
