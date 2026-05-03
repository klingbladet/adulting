export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export function shouldShowOnboarding(status: OnboardingStatus) {
  return (
    status === "not_started" ||
    status === "in_progress" ||
    status === "skipped"
  );
}

export function getPostAuthRedirectPath(status: OnboardingStatus) {
  if (status === "completed") {
    return "/learn";
  }

  return "/onboarding";
}