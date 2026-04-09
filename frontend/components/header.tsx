"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/logout-button";

export default function Header() {
const { data: session, isPending } = useSession();


  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Logga
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Hem
          </Link>
          <Link href="/menu" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Meny
          </Link>

          <div className="flex items-center gap-4">
        {isPending ? null : session ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/sign-up">Sign up</Link>
          </>
        )}
      </div>
        </nav>
      </div>
    </header>
  );
}