"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

<<<<<<< HEAD:frontend/components/header.tsx
  const isLoggedIn = !!session;
=======
  const role = session?.user?.role ?? "guest";
  const roles = String(role)
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const isSignedIn = !!session;
  const isCreator = roles.includes("creator") || roles.includes("admin");
  const isAdmin = roles.includes("admin");
>>>>>>> 10e97d6c4262427ed914a788ae941e75cb6d007a:frontend/components/navigation/header.tsx

  return (
    <header className="border-b bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
<<<<<<< HEAD:frontend/components/header.tsx
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
=======
        <Link href="/" className="text-xl font-bold text-primary">
          Adulting
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {!isPending &&
            (isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-foreground">
                  Dashboard
                </Link>

                {isCreator && (
                  <Link href="/creator" className="text-foreground">
                    Creator
                  </Link>
                )}

                {isAdmin && (
                  <Link href="/admin" className="text-foreground">
                    Admin
                  </Link>
                )}

                <LogoutButton />
              </>
>>>>>>> 10e97d6c4262427ed914a788ae941e75cb6d007a:frontend/components/navigation/header.tsx
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
<<<<<<< HEAD:frontend/components/header.tsx
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
=======
        <div className="flex flex-col gap-4 px-6 pb-4 md:hidden">
          {!isPending &&
            (isSignedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>

                {isCreator && (
                  <Link href="/creator" onClick={() => setMenuOpen(false)}>
                    Creator
                  </Link>
                )}

                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}

                <LogoutButton />
              </>
>>>>>>> 10e97d6c4262427ed914a788ae941e75cb6d007a:frontend/components/navigation/header.tsx
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