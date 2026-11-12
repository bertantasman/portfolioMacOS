export const ONBOARDING_STORAGE_KEY = "portfolio-onboarding-status";

/** "in-progress" is written when the invitation appears, so a refresh mid-tour never restarts it. */
export type StoredOnboarding = "in-progress" | "completed" | "skipped";

const VALUES: readonly string[] = ["in-progress", "completed", "skipped"];

export function readOnboarding(): StoredOnboarding | null {
  try {
    const value = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value && VALUES.includes(value) ? (value as StoredOnboarding) : null;
  } catch {
    return null;
  }
}

export function writeOnboarding(value: StoredOnboarding) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, value);
  } catch {
    /* ignore: onboarding just may show again next time */
  }
}
