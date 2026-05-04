import { CLIENT_BACKEND_URL  } from "@/lib/client-backend-url";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export type OnboardingStatusResponse = {
  onboardingStatus: OnboardingStatus;
  redirectTo: "/onboarding" | "/learn";
};

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await fetch(
    `${CLIENT_BACKEND_URL}/api/onboarding/status`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch onboarding status");
  }

  return response.json();
}