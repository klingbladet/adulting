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

export async function updateOnboardingStatus(status: OnboardingStatus) {
  const response = await fetch(
    `${CLIENT_BACKEND_URL}/api/onboarding/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not update onboarding status");
  }

  return response.json();
}