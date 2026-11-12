"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FocusEvent, PointerEvent, RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring, type MotionValue } from "motion/react";
import { magnificationScale } from "@/config/appearance";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useSettingsStore } from "@/store/settings-store";

/** Spring used for every magnification change. */
export const DOCK_SPRING = { stiffness: 350, damping: 28, mass: 0.7 } as const;

/** Gaussian width of the magnification bump, in multiples of the icon size. */
const SIGMA = 0.87;
/** Beyond this many icon sizes from the cursor an icon is left at rest. */
const CUTOFF = 2.7;
/** Fixed enlargement for keyboard-focused icons. */
const FOCUS_SCALE = 1.18;
/** Total extra width ≈ (maxScale - 1) × this × icon size (the bump's area). */
const EXTRA_WIDTH_UNITS = 2.2;
const VIEWPORT_MARGIN = 16;

export interface DockMagnificationField {
  /** Cursor x in client coordinates; Infinity while the pointer is away. */
  mouseX: MotionValue<number>;
  /** Largest scale the visitor's strength setting allows. */
  strengthMax: number;
  /** Cap that keeps the widened dock inside a narrow viewport (Infinity when there is room). */
  viewportCap: MotionValue<number>;
  /** False when magnification is off or motion is reduced; icons then never change size on hover. */
  enabled: boolean;
}

/** Dock-level pointer tracking. Writes only motion values: no React renders. */
export function useDockMagnification() {
  const reducedMotion = useShouldReduceMotion();
  const magnification = useSettingsStore((s) => s.dockMagnification);
  const strength = useSettingsStore((s) => s.dockMagnificationStrength);
  const enabled = !reducedMotion && magnification;
  const strengthMax = magnificationScale(strength);
  const mouseX = useMotionValue(Infinity);
  const viewportCap = useMotionValue(Infinity);

  const onPointerEnter = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.pointerType !== "mouse") return;
      // Resolve the CSS icon size to pixels, then limit magnification so the
      // dock can never grow wider than the viewport.
      const nav = e.currentTarget;
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;width:var(--dock-icon)";
      nav.appendChild(probe);
      const base = probe.offsetWidth;
      probe.remove();
      const room = window.innerWidth - VIEWPORT_MARGIN - nav.offsetWidth;
      const cap = base > 0 ? 1 + Math.max(0, room) / (EXTRA_WIDTH_UNITS * base) : 1;
      viewportCap.set(cap);
    },
    [enabled, viewportCap],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (enabled && e.pointerType === "mouse") mouseX.set(e.clientX);
    },
    [enabled, mouseX],
  );

  const onPointerLeave = useCallback(() => mouseX.set(Infinity), [mouseX]);

  const field: DockMagnificationField = { mouseX, strengthMax, viewportCap, enabled };
  return { field, handlers: { onPointerEnter, onPointerMove, onPointerLeave } };
}

/**
 * Per-icon scale: a spring that follows a Gaussian of the cursor's distance
 * from the icon's live centre, or sits at a fixed boost while keyboard-focused.
 */
export function useDockItemScale(
  ref: RefObject<HTMLElement | null>,
  field: DockMagnificationField,
) {
  const scale = useSpring(1, DOCK_SPRING);
  const focused = useRef(false);
  const { mouseX, strengthMax, viewportCap, enabled } = field;

  const retarget = useCallback(() => {
    const rest = enabled && focused.current ? FOCUS_SCALE : 1;
    const x = mouseX.get();
    const el = ref.current;
    if (!enabled || !el || !Number.isFinite(x)) {
      scale.set(rest);
      return;
    }
    // One layout read per icon per pointer event; no writes in between.
    const rect = el.getBoundingClientRect();
    const base = rect.width / scale.get();
    if (!(base > 0)) {
      scale.set(rest);
      return;
    }
    const d = Math.abs(x - (rect.left + rect.width / 2)) / base;
    const weight = d > CUTOFF ? 0 : Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
    const maxScale = Math.min(strengthMax, viewportCap.get());
    scale.set(Math.max(rest, 1 + (maxScale - 1) * weight));
  }, [enabled, mouseX, strengthMax, viewportCap, ref, scale]);

  // Settings changes (magnification on/off, strength) apply immediately, even mid-hover.
  useEffect(() => {
    retarget();
  }, [retarget]);

  useMotionValueEvent(mouseX, "change", retarget);

  const onFocus = useCallback(
    (e: FocusEvent<HTMLElement>) => {
      focused.current = e.target.matches(":focus-visible");
      retarget();
    },
    [retarget],
  );
  const onBlur = useCallback(() => {
    focused.current = false;
    retarget();
  }, [retarget]);

  return { scale, onFocus, onBlur };
}
