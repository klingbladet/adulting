import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url";
import type { OnboardingData } from "@/lib/onboarding";

export async function getServerOnboarding(): Promise<OnboardingData | null> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return {
      onboardingStatus: "completed",
      redirectTo: "/learn",
      currentStep: 3,
      stepOneData: {},
      stepTwoData: {},
      stepThreeData: {},
    };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("getServerOnboarding fetch error:", error);
    return null;
  }
}
