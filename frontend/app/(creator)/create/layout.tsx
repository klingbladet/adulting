import { requireRole } from "@/lib/guards";
import StaffSidebar from "@/components/staff/staff-sidebar";

export const dynamic = "force-dynamic";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["creator", "admin"]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <StaffSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
