"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <button onClick={handleLogout} className="rounded border px-4 py-2">
      Log out
    </button>
  );
}