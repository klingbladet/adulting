import { Suspense } from "react";
import { requireRole } from "@/lib/guards";
import CreatorToolsClient from "@/components/courses/create-content";
import StepNavigation from "@/components/courses/step-navigation";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans md:pr-20">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Laddar...</div>}>
        <CreatorToolsClient />
      </Suspense>
      <StepNavigation
        backPath="/create/creator-tools/create-blocks"
        nextPath="/create/creator-tools/create-quiz"
      />
    </div>
  );
}
