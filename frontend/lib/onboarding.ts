import { CLIENT_BACKEND_URL } from "@/lib/client-backend-url";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export type OnboardingData = {
  onboardingStatus: OnboardingStatus;
  redirectTo: "/onboarding" | "/learn";
  currentStep: number;
  stepOneData: Record<string, unknown>;
  stepTwoData: Record<string, unknown>;
  stepThreeData: Record<string, unknown>;
};

export async function getOnboarding(): Promise<OnboardingData> {
  const response = await fetch(`${CLIENT_BACKEND_URL}/api/onboarding`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not fetch onboarding");
  }

  return response.json();
}

export async function saveOnboardingStep(
  step: 1 | 2 | 3,
  data: Record<string, unknown>
) {
  const response = await fetch(`${CLIENT_BACKEND_URL}/api/onboarding/step`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ step, data }),
  });

  if (!response.ok) {
    throw new Error("Could not save onboarding step");
  }

  return response.json();
}

export async function skipOnboarding() {
  const response = await fetch(`${CLIENT_BACKEND_URL}/api/onboarding/skip`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not skip onboarding");
  }

  return response.json();
}

export async function updateOnboardingStatus(status: OnboardingStatus) {
  const response = await fetch(`${CLIENT_BACKEND_URL}/api/onboarding/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Could not update onboarding status");
  }

  return response.json();
}