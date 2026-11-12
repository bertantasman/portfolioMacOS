export type OnboardingStatus =
  /** Before the client has read storage: what the server renders. */
  | "initializing"
  /** A first visit that hasn't been invited yet (waiting for the desktop). */
  | "not-started"
  /** The welcome invitation is showing. */
  | "welcome"
  | "active"
  | "completed"
  | "skipped";

export type OnboardingActionId = "open-finder" | "open-projects" | "open-spotlight" | "open-mission-control" | "open-widget-gallery";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  /** Matches a data-onboarding-target attribute on a real element. Without one, a centred card is shown. */
  targetId?: string;
  placement?: "top" | "bottom" | "left" | "right";
  /** Keyboard shortcut to mention, where one exists. */
  shortcut?: string;
  /** Whether the highlighted element can be clicked during this step. */
  interactiveTarget?: boolean;
  /** One real action the step offers. */
  action?: { id: OnboardingActionId; label: string };
  /** Primary buttons on the final card replace Next. */
  final?: boolean;
}
