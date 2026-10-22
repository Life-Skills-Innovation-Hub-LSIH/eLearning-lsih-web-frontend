import type { LearningTrackId } from "@/shared/lib/learning-tracks";

const PREFIX = "lsih-onboarding:";

export type OnboardingChoice = LearningTrackId | "skipped";

function storageKey(userId: string) {
  return `${PREFIX}${userId}`;
}

export function hasCompletedOnboarding(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(storageKey(userId)));
}

export function getOnboardingChoice(userId: string): OnboardingChoice | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey(userId));
  return value as OnboardingChoice | null;
}

export function markOnboardingComplete(userId: string, choice: OnboardingChoice) {
  window.localStorage.setItem(storageKey(userId), choice);
}
