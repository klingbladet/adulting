"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  return (
    <header className="border-b bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Adult
        </Link>

        <nav className="hidden items-center gap-6 md:flex">

          {!isPending &&
            (session ? (
              <>
                <Link href="/dashboard" className="text-foreground">
                  Dashboard
                </Link>
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
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-border px-3 py-2 text-sm md:hidden"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-4 md:hidden">
          {/* <Link href="/" onClick={() => setMenuOpen(false)}>
            Hem
          </Link>
          <Link href="/menu" onClick={() => setMenuOpen(false)}>
            Meny
          </Link>
          <Link href="/lessons" onClick={() => setMenuOpen(false)}>
            Lessons
          </Link> */}

          {!isPending &&
            (session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
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