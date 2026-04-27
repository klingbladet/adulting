import { requireRole } from "@/lib/guards";

export default async function CreatorToolsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Creator Tools</h1>
      <p className="mt-2 text-muted-foreground">
        Verktyg för creators och admins.
      </p>
    </div>
  );
}