import { cookies } from "next/headers";

export async function getServerSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const baseUrl = process.env.BACKEND_URL || "http://backend:3001";

  console.log("Fetching session from:", `${baseUrl}/api/session`);

  try {
    const response = await fetch(`${baseUrl}/api/session`, {
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