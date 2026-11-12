"use client";

import { forwardRef } from "react";
import type { OnboardingStep } from "../types/onboarding";

interface TooltipProps {
  step: OnboardingStep;
  index: number;
  total: number;
  feedback: string | null;
  style?: React.CSSProperties;
  onAction: () => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const secondary = "h-8 rounded-full bg-black/[0.07] px-3.5 text-[13px] text-black/80 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)";
const primary = "h-8 rounded-full bg-(--accent) px-4 text-[13px] font-medium text-(--accent-fg) outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/** The instruction card: title, short text, one optional real action, progress and navigation. */
export const OnboardingTooltip = forwardRef<HTMLDivElement, TooltipProps>(function OnboardingTooltip(
  { step, index, total, feedback, style, onAction, onNext, onBack, onSkip, onFinish },
  ref,
) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={step.title}
      style={style}
      className="fixed w-[min(320px,calc(100vw-24px))] rounded-[18px] border border-black/10 bg-window p-4 text-black shadow-[0_16px_50px_rgba(0,0,0,0.38)] backdrop-blur-3xl backdrop-saturate-150"
    >
      {/* Progress: a thin bar and the step number. */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div aria-hidden className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-(--accent) transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="text-[11px] whitespace-nowrap text-black/50 tabular-nums">
          Step {index + 1} of {total}
        </span>
      </div>
      <h2 className="text-[16px] leading-tight font-semibold text-black/90">{step.title}</h2>
      <p className="mt-1.5 text-[13px] leading-5 text-black/65">{step.description}</p>
      {step.shortcut && <p className="mt-1.5 text-[12px] text-black/50">Shortcut: {step.shortcut}</p>}
      {feedback && (
        <p role="alert" className="mt-2 text-[12px] text-[#c0392b]">
          {feedback}
        </p>
      )}

      {step.action && (
        <button type="button" onClick={onAction} className={`${step.final ? secondary : "mt-3 rounded-full bg-black/[0.07] px-3.5 text-[13px] font-medium text-(--accent) outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)"} ${step.final ? "mt-3" : "h-8"}`}>
          {step.action.label}
        </button>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2">
        {step.final ? (
          <span />
        ) : (
          <button type="button" onClick={onSkip} className="rounded-md px-1.5 py-1 text-[12px] text-black/50 outline-none hover:text-black/80 focus-visible:ring-2 focus-visible:ring-(--accent)">
            Skip Tour
          </button>
        )}
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button type="button" onClick={onBack} className={secondary}>
              Back
            </button>
          )}
          {step.final ? (
            <button type="button" data-autofocus onClick={onFinish} className={primary}>
              Start Exploring
            </button>
          ) : (
            <button type="button" data-autofocus onClick={onNext} className={primary}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
