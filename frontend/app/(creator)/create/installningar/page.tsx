import { requireRole } from "@/lib/guards";

export default async function StaffSettingsPage() {
  await requireRole(["creator", "admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Staff-inställningar</h1>
      <p className="mt-2 text-muted-foreground">
        Inställningar för staff-portalen.
      </p>
    </div>
  );
}