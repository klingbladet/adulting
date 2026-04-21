import { requireRole } from "@/lib/guards";
import { routeAccess } from "@/lib/permissions";

export default async function AdminPage() {
  await requireRole(routeAccess.admin);

  return <div>Admin area</div>;
}