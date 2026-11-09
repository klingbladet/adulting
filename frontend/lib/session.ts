import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url";

export async function getServerSession() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return {
      user: {
        id: "demo-user-1",
        name: "Demo Student",
        email: "demo@adulting.se",
        role: "admin", // Admin role gives access to user, creator, and admin views
        image: null,
      },
      session: {
        id: "demo-session-id",
        userId: "demo-user-1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      },
    };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${BACKEND_URL}/api/session`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session ?? null;
  } catch (error) {
    console.error("getServerSession fetch error:", error);
    return null;
  }
}
