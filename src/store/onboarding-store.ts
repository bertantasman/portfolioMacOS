import { create } from "zustand";
import { onboardingSteps } from "@/features/onboarding/data/onboarding-steps";
import type { OnboardingStatus } from "@/features/onboarding/types/onboarding";
import { readOnboarding, writeOnboarding } from "@/features/onboarding/utils/onboarding-storage";
import { useOverlayStore } from "./overlay-store";

interface OnboardingStore {
  status: OnboardingStatus;
  currentStep: number;
  /** A one-time pointer at the Projects folder, set only when this visit's welcome was dismissed. Never persisted. */
  hint: "projects" | null;
  dismissHint: () => void;
  /** Reads storage once on the client. Only a visitor with nothing stored is invited. */
  hydrate: () => void;
  /** Shows the welcome invitation (first visit, once the desktop is ready). */
  invite: () => void;
  /** Begins the tour at the first step; also used to restart it later. */
  start: () => void;
  next: () => void;
  back: () => void;
  /** `skip({ hint: true })` is a plain dismissal of the welcome: it leaves the Projects hint behind. */
  skip: (options?: { hint?: boolean }) => void;
  complete: () => void;
}

const lastStep = onboardingSteps.length - 1;

/**
 * One status for the whole experience. Closing it never touches windows or settings, and persisting
 * "in-progress" at the invitation means a refresh mid-tour returns to a plain desktop.
 */
export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  status: "initializing",
  currentStep: 0,
  hint: null,
  dismissHint: () => set({ hint: null }),

  hydrate: () => {
    if (get().status !== "initializing") return;
    const stored = readOnboarding();
    set({ status: stored === null ? "not-started" : stored === "completed" ? "completed" : "skipped" });
  },

  invite: () => {
    if (get().status !== "not-started") return;
    writeOnboarding("in-progress");
    set({ status: "welcome", currentStep: 0 });
  },

  start: () => {
    // Everything else steps aside so the highlighted parts of the desktop are reachable.
    useOverlayStore.getState().close();
    writeOnboarding("in-progress");
    set({ status: "active", currentStep: 0 });
  },

  next: () => {
    if (get().status !== "active") return;
    useOverlayStore.getState().close();
    set((s) => ({ currentStep: Math.min(lastStep, s.currentStep + 1) }));
  },

  back: () => {
    if (get().status !== "active") return;
    useOverlayStore.getState().close();
    set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) }));
  },

  skip: (options) => {
    const viaClose = options?.hint === true;
    if (get().status !== "welcome" && get().status !== "active") return;
    useOverlayStore.getState().close();
    // Dismissing the welcome window (button, X or Escape) counts as done; leaving the tour midway is "skipped".
    const fromWelcome = get().status === "welcome";
    writeOnboarding(fromWelcome ? "completed" : "skipped");
    // Closing the welcome without choosing leaves a small pointer at the Projects folder; it is session-only.
    set({ status: fromWelcome ? "completed" : "skipped", hint: fromWelcome && viaClose ? "projects" : null });
  },

  complete: () => {
    if (get().status !== "active") return;
    useOverlayStore.getState().close();
    writeOnboarding("completed");
    set({ status: "completed" });
  },
}));
