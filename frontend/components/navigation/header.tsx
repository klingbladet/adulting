"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";
import ThemeToggle from "@/components/ui/theme-toggle";
import AiChatModal from "@/components/chat/ai-chat-modal";
import type { AiLearningContext } from "@/lib/learning-context";
import { usePathname } from "next/navigation";


const ChatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 18" fill="none" className={className}>
    {/* Klistra in innehållet från chat.svg här nedan */}
    <path
      d="M19.25 13.993C19.2497 13.0967 19.0271 12.2145 18.6022 11.4253C18.1772 10.6362 17.5632 9.96471 16.8151 9.47107C16.0671 8.97742 15.2082 8.677 14.3155 8.59671C13.4228 8.51642 12.5242 8.65877 11.7 9.011M13.833 7.372C13.3982 7.372 12.9676 7.28636 12.5659 7.11996C12.1642 6.95357 11.7992 6.70969 11.4918 6.40223C11.1843 6.09478 10.9404 5.72977 10.774 5.32806C10.6076 4.92636 10.522 4.49581 10.522 4.061C10.522 3.62619 10.6076 3.19564 10.774 2.79394C10.9404 2.39223 11.1843 2.02722 11.4918 1.71977C11.7992 1.41231 12.1642 1.16843 12.5659 1.00203C12.9676 0.835642 13.3982 0.75 13.833 0.75C14.7111 0.75 15.5533 1.09884 16.1742 1.71977C16.7952 2.3407 17.144 3.18287 17.144 4.061C17.144 4.93913 16.7952 5.7813 16.1742 6.40223C15.5533 7.02316 14.7111 7.372 13.833 7.372Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.3165V11.2054H8.88889V10.0943C8.88801 9.79988 8.77067 9.51777 8.56248 9.30959C8.3543 9.10141 8.07219 8.98406 7.77778 8.98318H6.66667V7.87207H5.55556V8.98318H4.44444V7.87207H3.33333V8.98318H2.22222C1.92781 8.98406 1.6457 9.10141 1.43752 9.30959C1.22934 9.51777 1.11199 9.79988 1.11111 10.0943V11.2054H0V12.3165H1.11111V13.4276H0V14.5387H1.11111V15.6498C1.11199 15.9443 1.22934 16.2264 1.43752 16.4346C1.6457 16.6427 1.92781 16.7601 2.22222 16.761H3.33333V17.8721H4.44444V16.761H5.55556V17.8721H6.66667V16.761H7.77778C8.07219 16.7601 8.3543 16.6427 8.56248 16.4346C8.77067 16.2264 8.88801 15.9443 8.88889 15.6498V14.5387H10V13.4276H8.88889V12.3165H10ZM7.77778 15.6498H2.22222V10.0943H7.77778V15.6498Z"
      fill="currentColor"
    />
    <path
      d="M4.64514 10.6499H3.89792L2.78125 15.0943H3.35181L3.60958 14.0527H4.89625L5.14736 15.0943H5.73736L4.64514 10.6499ZM3.68458 13.6077L4.25014 11.1777H4.27569L4.82181 13.6077H3.68458ZM6.24681 10.6499H6.80236V15.0943H6.24681V10.6499Z"
      fill="currentColor"
    />
  </svg>
);

function getLearningContextFromPathname(
  pathname: string,
): AiLearningContext | undefined {
  const parts = pathname.split("/").filter(Boolean);

  const coursesIndex = parts.indexOf("courses");
  const courseId = coursesIndex >= 0 ? parts[coursesIndex + 1] : undefined;

  if (!courseId) {
    return undefined;
  }

  return {
    courseId,
    mode: "course_recommendation",
  };
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
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

  const learningContext = getLearningContextFromPathname(pathname);


  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-12 pb-2 px-6 relative md:pb-6 text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Adulting
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {!isPending &&
            (isSignedIn ? (
              <>
                {canAccessUserApp && (
                  <Link href="/profile" className="text-foreground">
                    Profil
                  </Link>
                )}
                 <AiChatModal
                              learningContext={learningContext}
                              trigger={(open) => (
                                <button
                                  type="button"
                                  onClick={open}
                                  className="flex flex-col items-center px-3"
                                >
                                  <ChatIcon
                                    className="w-14 h-7 p-1.5"
                                  />
                                  <span className="text-xs text-gray-400 dark:text-gray-500">Chatt</span>
                                </button>
                              )}
                            />
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
      {/* rad 2 */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <nav className="hidden items-center gap-6 md:flex">
          {!isPending &&
            (isSignedIn ? (
              <>
                {canAccessUserApp && (
                  <Link href="/learn" className="text-foreground">
                    Hem
                  </Link>
                )}

                {canAccessUserApp && (
                  <Link href="/courses" className="text-foreground">
                    Kurser
                  </Link>
                )}

                {canAccessStaff && (
                  <Link href="/create" className="text-foreground">
                    Creator Zone
                  </Link>
                )}

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
                  <Link href="/learn" onClick={closeMenu}>
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