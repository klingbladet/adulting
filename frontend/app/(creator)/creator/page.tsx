import { requireRole } from "@/lib/guards";
import { routeAccess } from "@/lib/permissions";

export default async function CreatorPage() {
  await requireRole(routeAccess.creator);

  return <div>Creator area</div>;
}