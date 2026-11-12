"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionTemplate } from "motion/react";
import { getExternalUrl } from "@/config/applications";
import {
  useDockItemScale,
  type DockMagnificationField,
} from "@/hooks/use-dock-magnification";
import { useDockBounce } from "@/hooks/use-dock-bounce";
import { preloadApp } from "@/components/windows/app-loaders";
import type { ApplicationDefinition } from "@/types/application";
import { DockRunningIndicator } from "./dock-running-indicator";
import { DockTooltip, type TooltipAlign } from "./dock-tooltip";

interface DockItemProps {
  app: ApplicationDefinition;
  running: boolean;
  magnification: DockMagnificationField;
  tooltipAlign: TooltipAlign;
  /** Hidden below 520px wide, where only the primary section fits. */
  hideOnNarrow: boolean;
  onLaunch: (app: ApplicationDefinition) => void;
}

/** Dock icons the onboarding tour can point at. */
const onboardingTargets: Partial<Record<string, string>> = { finder: "onboarding-finder", "mission-control": "onboarding-mission-control" };

const controlClass =
  "relative block size-full rounded-[12px] before:absolute before:-inset-x-[3px] before:-inset-y-1.5 before:content-[''] outline-none transition-[filter] duration-100 hover:brightness-110 active:brightness-90 focus-visible:ring-2 focus-visible:ring-white/80";

export function DockItem({
  app,
  running,
  magnification,
  tooltipAlign,
  hideOnNarrow,
  onLaunch,
}: DockItemProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const { scale, onFocus, onBlur } = useDockItemScale(iconRef, magnification);
  const { y, bounce } = useDockBounce();

  // The slot's width and the icon's size share one value, so neighbours are
  // pushed apart by layout instead of being overlapped by a transform.
  const size = useMotionTemplate`calc(var(--dock-icon) * ${scale})`;
  const slotWidth = useMotionTemplate`calc(var(--dock-icon) * ${scale} + 6px)`;

  const image = (
    <motion.div style={{ y }} className="size-full">
      <Image
        src={app.icon}
        alt=""
        width={128}
        height={128}
        unoptimized
        draggable={false}
        className="size-full select-none"
      />
    </motion.div>
  );

  let control: React.ReactNode;
  if (app.type === "external") {
    const href = getExternalUrl(app);
    control = href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${app.name} (opens in a new tab)`}
        className={`${controlClass} cursor-pointer`}
      >
        {image}
      </a>
    ) : (
      // No profile configured: stays focusable for its name but goes nowhere.
      <button
        type="button"
        aria-disabled="true"
        aria-label={`${app.name} (link not configured)`}
        className={`${controlClass} cursor-default`}
      >
        {image}
      </button>
    );
  } else {
    control = (
      <button
        type="button"
        aria-label={app.name}
        onClick={() => {
          bounce();
          onLaunch(app);
        }}
        className={`${controlClass} cursor-pointer`}
      >
        {image}
      </button>
    );
  }

  return (
    <motion.li
      style={{ width: slotWidth }}
      data-onboarding-target={onboardingTargets[app.id]}
      // Start fetching the app's code as soon as the visitor shows interest in it.
      onPointerEnter={() => preloadApp(app.id)}
      onTouchStart={() => preloadApp(app.id)}
      onFocus={(e) => {
        preloadApp(app.id);
        onFocus(e);
      }}
      onBlur={onBlur}
      className={`group relative h-(--dock-icon) shrink-0 ${hideOnNarrow ? "max-[519px]:hidden" : ""}`}
    >
      {/* Anchored to the slot's bottom edge so icons grow upward. */}
      <motion.div
        ref={iconRef}
        style={{ height: size }}
        className="absolute inset-x-[3px] bottom-0"
      >
        {control}
        <DockTooltip label={app.name} align={tooltipAlign} />
      </motion.div>
      <DockRunningIndicator running={running} />
    </motion.li>
  );
}
