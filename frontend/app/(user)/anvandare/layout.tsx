import { requireRole } from "@/lib/guards";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["user", "creator", "admin"]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-6">{children}</main>
    </div>
  );
}