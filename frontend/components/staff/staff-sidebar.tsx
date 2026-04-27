import Link from "next/link";

export default function StaffSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-6 text-lg font-semibold">Staff</h2>

      <nav className="flex flex-col gap-2">
        <Link
          href="/staff"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Overview
        </Link>

        <Link
          href="/staff/users"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Users
        </Link>

        <Link
          href="/staff/creator-tools"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Creator tools
        </Link>

        <Link
          href="/staff/installningar"
          className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Inställningar
        </Link>
      </nav>
    </aside>
  );
}