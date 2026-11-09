import { BACKEND_URL } from "@/lib/backend-url";

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

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function getOnboarding(): Promise<OnboardingData> {
  if (isDemo) {
    return {
      onboardingStatus: "completed",
      redirectTo: "/learn",
      currentStep: 3,
      stepOneData: {},
      stepTwoData: {},
      stepThreeData: {},
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not fetch onboarding");
    }

    return await response.json();
  } catch (error) {
    console.warn("Falling back to demo onboarding:", error);
    return {
      onboardingStatus: "completed",
      redirectTo: "/learn",
      currentStep: 3,
      stepOneData: {},
      stepTwoData: {},
      stepThreeData: {},
    };
  }
}

export async function saveOnboardingStep(
  step: 1 | 2 | 3,
  data: Record<string, unknown>
) {
  if (isDemo) {
    return { ok: true, step, data };
  }

  const response = await fetch(`${BACKEND_URL}/api/onboarding/step`, {
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
  if (isDemo) {
    return { ok: true };
  }

  const response = await fetch(`${BACKEND_URL}/api/onboarding/skip`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not skip onboarding");
  }

  return response.json();
}

export async function updateOnboardingStatus(status: OnboardingStatus) {
  if (isDemo) {
    return { ok: true, status };
  }

  const response = await fetch(`${BACKEND_URL}/api/onboarding/status`, {
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
