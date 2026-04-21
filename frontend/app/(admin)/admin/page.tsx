import { requireRole } from "@/lib/guards";
import { routeAccess } from "@/lib/permissions";

export default async function AdminPage() {
  await requireRole(routeAccess.admin);

  return       <div className="bg-background text-foreground p-8 min-h-screen">
                Admin area
               </div>;
}