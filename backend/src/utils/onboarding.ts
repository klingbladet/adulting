export const onboardingStatuses = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export function isOnboardingStatus(value: unknown): value is OnboardingStatus {
  return (
    typeof value === "string" &&
    onboardingStatuses.includes(value as OnboardingStatus)
  );
}

export function getPostAuthRedirectPath(status: OnboardingStatus) {
  if (status === "completed" || status === "skipped") {
    return "/learn";
  }

  return "/onboarding";
}

export function getNextOnboardingStep(currentStep: number) {
  return Math.min(currentStep + 1, 3);
}