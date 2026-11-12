import { navigateFinderToFolder, openApplicationById } from "@/lib/navigation";
import { useOverlayStore } from "@/store/overlay-store";
import type { OnboardingActionId } from "../types/onboarding";

interface ActionResult {
  ok: boolean;
  /** The action opened a full overlay, so the tour steps aside instead of advancing. */
  opensOverlay: boolean;
}

/** Tutorial buttons run the same functions the rest of the desktop uses. Nothing is simulated. */
export function runOnboardingAction(id: OnboardingActionId): ActionResult {
  switch (id) {
    case "open-finder":
      return { ok: openApplicationById("finder"), opensOverlay: false };
    case "open-projects":
      // Finder, at the Projects folder: the same navigation Spotlight and Finder use.
      return { ok: navigateFinderToFolder("projects"), opensOverlay: false };
    case "open-spotlight":
      useOverlayStore.getState().open("spotlight");
      return { ok: true, opensOverlay: true };
    case "open-mission-control":
      return { ok: openApplicationById("mission-control"), opensOverlay: true };
    case "open-widget-gallery":
      useOverlayStore.getState().open("widget-gallery");
      return { ok: true, opensOverlay: true };
  }
}
