"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/ui/logout-button";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-6">Loading...</p>;
  }

  if (!session) {
    return (
      <main className="p-6">
        <p>You are not signed in.</p>
        <Link href="/sign-in" className="underline">
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Hej {session.user.name}</p>
      <p>{session.user.email}</p>
      <LogoutButton />
    </main>
  );
}