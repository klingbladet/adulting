import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url";

export async function getServerSession() {
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