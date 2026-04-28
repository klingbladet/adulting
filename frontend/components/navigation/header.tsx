"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const role = session?.user?.role ?? "guest";
  const roles = String(role)
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const isSignedIn = !!session;
  const isCreator = roles.includes("creator") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

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
                  <Link href="/learn" className="text-foreground">
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
                  className="rounded-xl border border-border px-4 py-2 text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Sign up
                </Link>
              </>
            ))}

          <ThemeToggle />
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-border px-3 py-2 text-sm md:hidden"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-4 md:hidden">
          {!isPending &&
            (isSignedIn ? (
              <>
                {canAccessUserApp && (
                  <Link href="/learn" onClick={closeMenu}>
                    Användare
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
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
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