"use client";

import { Desktop } from "@/components/desktop/desktop";
import { OnboardingController } from "@/features/onboarding/components/onboarding-controller";
import { StartupController } from "@/features/startup/components/startup-controller";

/** The macOS-inspired desktop with its startup and welcome flows, exactly as before; only mounted on wide viewports. */
export default function DesktopShell() {
  return (
    <>
      <Desktop />
      <StartupController />
      <OnboardingController />
    </>
  );
}
