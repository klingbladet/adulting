import { requireUser } from "@/lib/guards";
import DashboardSidebar from "@/components/user/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}