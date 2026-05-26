"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Compass,
  Menu,
  ShieldPlus,
  User,
  X,
  ChevronDown, 
  Settings
} from "lucide-react";

import AiChatModal from "@/components/chat/ai-chat-modal";
import { LogoutButton } from "@/components/ui/logout-button";
import { useSession } from "@/lib/auth-client";
import type { AiLearningContext } from "@/lib/learning-context";

const ChatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 18" fill="none" className={className}>
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

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  staffOnly?: boolean;
};

const navLinks: NavLink[] = [
  {
    href: "/learn",
    label: "Hem",
    icon: Compass,
  },
  {
    href: "/courses",
    label: "Kurser",
    icon: BookOpen,
  },
  {
    href: "/create",
    label: "Creator",
    icon: ShieldPlus,
    staffOnly: true,
  },
];

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

function getUserRoles(session: unknown) {
  const user = (session as { user?: { role?: string | string[] } } | null)?.user;
  const role = user?.role;

  if (Array.isArray(role)) {
    return role;
  }

  return String(role ?? "guest")
    .split(",")
    .map((roleName) => roleName.trim())
    .filter(Boolean);
}

function isActivePath(pathname: string, href: string) {
  if (href === "/learn") {
    return pathname === "/learn";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const roles = getUserRoles(session);
  const isSignedIn = !!session;

  const canAccessUserApp =
    roles.includes("user") ||
    roles.includes("creator") ||
    roles.includes("admin");

  const canAccessStaff = roles.includes("creator") || roles.includes("admin");

  const learningContext = getLearningContextFromPathname(pathname);

  const visibleLinks = navLinks.filter((link) => {
    if (!canAccessUserApp) {
      return false;
    }

    if (link.staffOnly && !canAccessStaff) {
      return false;
    }

    return true;
  });

  function closeMenu() {
  setMenuOpen(false);
  setProfileOpen(false);
}

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] text-foreground shadow-sm dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href={isSignedIn ? "/learn" : "/"}
          className="rounded-full bg-card/80 px-4 py-2 font-heading text-lg font-bold text-primary shadow-sm transition hover:bg-card"
        >
          Adulting
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {!isPending &&
            isSignedIn &&
            visibleLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isActivePath(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-card text-primary shadow-sm"
                      : "text-foreground/80 hover:bg-card/70 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}

          {!isPending && isSignedIn && canAccessUserApp && (
            <AiChatModal
              learningContext={learningContext}
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-card/70 hover:text-primary"
                >
                  <ChatIcon className="h-4 w-4" />
                  Chatt
                </button>
              )}
            />
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
  {!isPending &&
    (isSignedIn ? (
      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-card"
          aria-expanded={profileOpen}
          aria-haspopup="menu"
        >
          <User className="h-4 w-4" />
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xl">
            <Link
              href="/profile"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-muted"
            >
              <User className="h-4 w-4 text-primary" />
              Min profil
            </Link>

            <Link
              href="/profile/settings"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-muted"
            >
              <Settings className="h-4 w-4 text-primary" />
              Inställningar
            </Link>

            <div className="border-t border-border px-4 py-3">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    ) : (
      <>
        <Link
          href="/sign-in"
          className="rounded-full border border-border bg-card/50 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card"
        >
          Sign in
        </Link>

        <Link
          href="/sign-up"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Sign up
        </Link>
      </>
    ))}
</div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full border border-border bg-card/70 p-2 text-foreground shadow-sm transition hover:bg-card md:hidden"
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-card/80 px-4 pb-4 pt-3 backdrop-blur md:hidden">
          {!isPending &&
            (isSignedIn ? (
              <div className="space-y-2">
                {visibleLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = isActivePath(pathname, href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  );
                })}

                {canAccessUserApp && (
                  <AiChatModal
                    learningContext={learningContext}
                    trigger={(open) => (
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          open();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        <ChatIcon className="h-5 w-5" />
                        Chatt
                      </button>
                    )}
                  />
                )}

               <div className="border-t border-border pt-2">
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <User className="h-5 w-5" />
                  Min profil
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <Settings className="h-5 w-5" />
                  Inställningar
                </Link>

                <div className="px-4 py-3">
                  <LogoutButton />
                </div>
              </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Sign up
                </Link>
              </div>
            ))}
        </div>
      )}
    </header>
  );
}