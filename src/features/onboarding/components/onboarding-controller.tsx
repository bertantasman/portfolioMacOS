"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useStartupStore } from "@/store/startup-store";
import { useWindowStore } from "@/store/window-store";
import { onboardingSteps } from "../data/onboarding-steps";
import { useOnboardingTarget } from "../hooks/use-onboarding-target";
import { runOnboardingAction } from "../utils/onboarding-actions";
import { placeTooltip } from "../utils/onboarding-position";
import { OnboardingOverlay } from "./onboarding-overlay";
import { OnboardingTooltip } from "./onboarding-tooltip";
import { OnboardingWelcome } from "./onboarding-welcome";

/**
 * Runs the welcome invitation and the tour on top of the desktop. It only starts once the startup
 * sequence has reached the desktop, never touches windows or settings, and ends predictably.
 */
export function OnboardingController() {
  const status = useOnboardingStore((s) => s.status);
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const invite = useOnboardingStore((s) => s.invite);
  const skip = useOnboardingStore((s) => s.skip);
  const startupPhase = useStartupStore((s) => s.phase);
  const previousFocus = useRef<Element | null>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // First visit: invite shortly after the desktop is ready (not while the lock screen is up).
  useEffect(() => {
    if (status !== "not-started" || startupPhase !== "desktop") return;
    const timer = setTimeout(invite, 700);
    return () => clearTimeout(timer);
  }, [status, startupPhase, invite]);

  const running = (status === "welcome" || status === "active") && startupPhase === "desktop";

  // The welcome modal is modal: the desktop behind it can't be reached until it's answered.
  useEffect(() => {
    const main = document.querySelector("main");
    if (status === "welcome" && startupPhase === "desktop") main?.setAttribute("inert", "");
    return () => {
      if (startupPhase === "desktop") main?.removeAttribute("inert");
    };
  }, [status, startupPhase]);

  // Escape ends onboarding, unless it is closing another overlay (Spotlight, Mission Control, …).
  useEffect(() => {
    if (!running) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useOverlayStore.getState().active === null) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [running, skip]);

  // Give focus back when onboarding ends: to the active window if there is one, else to where it was.
  useEffect(() => {
    if (running && !wasActive.current) previousFocus.current = document.activeElement;
    if (!running && wasActive.current) {
      const focusedId = useWindowStore.getState().focusedWindowId;
      const target =
        (focusedId && document.querySelector<HTMLElement>(`[data-window-id="${CSS.escape(focusedId)}"]`)) ||
        (previousFocus.current instanceof HTMLElement && previousFocus.current.isConnected ? previousFocus.current : null);
      target?.focus({ preventScroll: true });
    }
    wasActive.current = running;
  }, [running]);

  if (!running) return null;
  return status === "welcome" ? <OnboardingWelcome /> : <Tour />;
}

function Tour() {
  const index = useOnboardingStore((s) => s.currentStep);
  const next = useOnboardingStore((s) => s.next);
  const back = useOnboardingStore((s) => s.back);
  const skip = useOnboardingStore((s) => s.skip);
  const complete = useOnboardingStore((s) => s.complete);
  // While another interface (Spotlight, Mission Control, …) is open, the tour steps aside: no dimming, card only.
  const overlayOpen = useOverlayStore((s) => s.active !== null);
  const reduced = useShouldReduceMotion();
  const step = onboardingSteps[index];
  const box = useOnboardingTarget(step.targetId, true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackStep, setFeedbackStep] = useState(index);
  if (feedbackStep !== index) {
    setFeedbackStep(index);
    setFeedback(null);
  }

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) => (prev && prev.width === r.width && prev.height === r.height ? prev : { width: r.width, height: r.height }));
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [index]);

  // Each new step puts focus on its main button, so the tour works from the keyboard.
  // (Focus only works once the card is visible, i.e. after it has been measured.)
  const measured = size !== null;
  useEffect(() => {
    if (measured) cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, [index, measured]);

  const act = () => {
    if (!step.action) return;
    const result = runOnboardingAction(step.action.id);
    if (!result.ok) {
      // Say so rather than pretending it worked; the tour carries on.
      setFeedback(`Couldn’t do that just now. You can continue with Next.`);
      return;
    }
    setFeedback(null);
    if (result.opensOverlay) return; // stay on this step while it is open
    if (step.final) complete();
    else next();
  };

  const highlighted = box && !overlayOpen;
  let style: React.CSSProperties;
  const placed = box && size && !overlayOpen ? placeTooltip(box, size, viewport, step.placement) : null;
  if (overlayOpen) style = { top: 44, left: "50%", transform: "translateX(-50%)" };
  else if (placed) style = { left: placed.left, top: placed.top };
  else style = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }; // no target (or it doesn't fit): a centred card
  if (!size) style = { ...style, visibility: "hidden" };

  return (
    <>
      {highlighted && placed && <OnboardingOverlay box={box} interactive={!!step.interactiveTarget} />}
      <div className="fixed inset-0 z-(--z-onboarding) pointer-events-none">
        <div className="pointer-events-auto" style={{ transition: reduced ? "none" : undefined }}>
          <OnboardingTooltip
            ref={cardRef}
            step={step}
            index={index}
            total={onboardingSteps.length}
            feedback={feedback}
            style={style}
            onAction={act}
            onNext={next}
            onBack={back}
            onSkip={skip}
            onFinish={complete}
          />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        Step {index + 1} of {onboardingSteps.length}: {step.title}.
      </p>
    </>
  );
}
