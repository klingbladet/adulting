import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { normalizeRoles } from "@/lib/permissions";

export async function requireUser() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(allowedRoles: readonly string[]) {
  const session = await requireUser();
  const userRoles = normalizeRoles(session.user?.role);

  const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireGuest() {
  // In demo mode, allow visitors to explore the sign-in / sign-up pages too
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return;
  }

  const session = await getServerSession();

  if (session) {
    redirect("/learn");
  }
}
