"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const isLoggedIn = !!session;

  return (
    <header className="border-b bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Adult
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-foreground hover:text-primary">
            Hem
          </Link>

          <Link href="/menu" className="text-foreground hover:text-primary">
            Meny
          </Link>

          <Link href="/lessons" className="text-foreground hover:text-primary">
            Lessons
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/chat"
                className="text-foreground hover:text-primary"
              >
                Chatt
              </Link>

              <Link
                href="/dashboard"
                className="text-foreground hover:text-primary"
              >
                Dashboard
              </Link>
            </>
          )}

          {!isPending &&
            (isLoggedIn ? (
              <LogoutButton />
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
          className="rounded-xl border border-border px-3 py-2 text-sm md:hidden"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t px-6 py-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Hem
          </Link>

          <Link href="/menu" onClick={() => setMenuOpen(false)}>
            Meny
          </Link>

          <Link href="/lessons" onClick={() => setMenuOpen(false)}>
            Lessons
          </Link>

          {isLoggedIn && (
            <>
              <Link href="/chat" onClick={() => setMenuOpen(false)}>
                Chatt
              </Link>

              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            </>
          )}

          {!isPending &&
            (isLoggedIn ? (
              <LogoutButton />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
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