"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const role = (session?.user as { role?: string } | undefined)?.role ?? "guest";

  const roles = String(role)
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const isSignedIn = !!session;

  const canAccessUserApp =
    roles.includes("user") ||
    roles.includes("creator") ||
    roles.includes("admin");

  const canAccessStaff =
    roles.includes("creator") || roles.includes("admin");

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Adulting
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {!isPending &&
            (isSignedIn ? (
              <>
                {canAccessUserApp && (
                  <Link href="/courses" className="text-foreground">
                    Learn
                  </Link>
                )}

                {canAccessStaff && (
                  <Link href="/create" className="text-foreground">
                    Create
                  </Link>
                )}

                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Sign up
                </Link>
              </>
            ))}

          <ThemeToggle />
        </nav>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-lg border border-border p-2 md:hidden"
          aria-label="Open menu"
          type="button"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-4 text-center md:hidden">
          {!isPending &&
            (isSignedIn ? (
              <>
                {canAccessUserApp && (
                  <Link href="/courses" onClick={closeMenu}>
                    Learn
                  </Link>
                )}

                {canAccessStaff && (
                  <Link href="/create" onClick={closeMenu}>
                    Staff
                  </Link>
                )}

                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Sign up
                </Link>
              </>
            ))}

          <ThemeToggle />
        </div>
      )}
    </header>
  );
}