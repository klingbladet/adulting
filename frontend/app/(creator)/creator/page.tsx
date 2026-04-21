import { requireRole } from "@/lib/guards";
import { routeAccess } from "@/lib/permissions";

export default async function CreatorPage() {
  await requireRole(routeAccess.creator);

  return       <div className="bg-background text-foreground p-8 min-h-screen">
                  Creator area
                </div>;
}