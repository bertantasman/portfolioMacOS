/** Set once the visitor has been through the startup sequence. */
export const STARTUP_STORAGE_KEY = "portfolio-startup-completed";
const COMPLETED = "1";

type Area = "localStorage" | "sessionStorage";

function read(area: Area): string | null {
  try {
    return window[area].getItem(STARTUP_STORAGE_KEY);
  } catch {
    return null; // blocked or unavailable
  }
}

function write(area: Area, value: string) {
  try {
    window[area].setItem(STARTUP_STORAGE_KEY, value);
  } catch {
    /* ignore: the app works without persistence */
  }
}

/**
 * Whether the startup sequence has already been completed. Only the exact stored value counts, so
 * anything unexpected is treated as "not completed" and the visitor simply sees the sequence once more.
 * sessionStorage is a second source, so a refresh stays on the desktop even if localStorage is blocked.
 */
export function hasCompletedStartup(): boolean {
  return read("localStorage") === COMPLETED || read("sessionStorage") === COMPLETED;
}

export function markStartupCompleted() {
  write("localStorage", COMPLETED);
  write("sessionStorage", COMPLETED);
}
