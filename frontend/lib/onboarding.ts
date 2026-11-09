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
    if (typeof window !== "undefined") {
      const status =
        (sessionStorage.getItem("demo_onboarding_status") as OnboardingStatus) ||
        "not_started";
      const step = Number(sessionStorage.getItem("demo_onboarding_step") || "1");
      const stepOne = JSON.parse(
        sessionStorage.getItem("demo_step_one") || "{}"
      );
      const stepTwo = JSON.parse(
        sessionStorage.getItem("demo_step_two") || "{}"
      );

      return {
        onboardingStatus: status,
        redirectTo: "/learn",
        currentStep: step,
        stepOneData: stepOne,
        stepTwoData: stepTwo,
        stepThreeData: {},
      };
    }

    return {
      onboardingStatus: "not_started",
      redirectTo: "/learn",
      currentStep: 1,
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
      onboardingStatus: "not_started",
      redirectTo: "/learn",
      currentStep: 1,
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
    if (typeof window !== "undefined") {
      if (step === 1) {
        sessionStorage.setItem("demo_step_one", JSON.stringify(data));
        sessionStorage.setItem("demo_onboarding_step", "2");
        sessionStorage.setItem("demo_onboarding_status", "in_progress");
      } else if (step === 2) {
        sessionStorage.setItem("demo_step_two", JSON.stringify(data));
        sessionStorage.setItem("demo_onboarding_status", "completed");
      }
    }
    return { ok: true, step, data, redirectTo: "/learn" };
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demo_onboarding_status", "skipped");
    }
    return { ok: true, redirectTo: "/learn" };
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demo_onboarding_status", status);
    }
    return { ok: true, status, redirectTo: "/learn" };
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
