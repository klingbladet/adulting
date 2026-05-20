import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { normalizeRoles } from "@/lib/permissions";

export default async function StaffSidebar() {
  const session = await getServerSession();
  const roles = normalizeRoles(session?.user?.role);

  const isAdmin = roles.includes("admin");
  const canAccessCreatorTools =
    roles.includes("creator") || roles.includes("admin");

  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-6 text-lg font-semibold">Creators Page</h2>

      <nav className="flex flex-col gap-2">
        <Link
          href="/create"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Översikt 
        </Link>

        {isAdmin && (
          <Link
            href="/create/users"
            className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            Användare
          </Link>
        )}

        {isAdmin && (
          <Link
            href={`/create/admin/reviews`}
            className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            Godkänna
          </Link>
        )}

        {canAccessCreatorTools && (
          <Link
            href="/create/creator-tools"
            className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            Creator tools
          </Link>
        )}

        <Link
          href="/create/installningar"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Inställningar
        </Link>
      </nav>
    </aside>
  );
}