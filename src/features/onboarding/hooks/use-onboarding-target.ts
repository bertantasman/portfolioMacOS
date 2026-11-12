"use client";

import { useEffect, useState } from "react";
import type { Box } from "../utils/onboarding-position";

const toBox = (r: DOMRect): Box => ({ left: r.left, top: r.top, width: r.width, height: r.height });

/**
 * The on-screen box of the element carrying `data-onboarding-target={id}`, or null when it isn't
 * there or isn't visible (a hidden Dock icon on a narrow screen, say). It is measured when the id
 * changes and then kept current by a ResizeObserver and window resize, never by polling.
 */
export function useOnboardingTarget(id: string | undefined, enabled: boolean): Box | null {
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!id || !enabled) {
      // Nothing to track: clear any previous box.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBox(null);
      return;
    }
    let observer: ResizeObserver | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-onboarding-target="${CSS.escape(id)}"]`);
      const r = el?.getBoundingClientRect();
      const visible = r && r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight;
      setBox(visible ? toBox(r) : null);
      return el ?? null;
    };

    const el = measure();
    if (el) {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    } else {
      // The target may mount a moment later (widgets hydrate after the desktop).
      retry = setTimeout(measure, 400);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      if (retry) clearTimeout(retry);
      window.removeEventListener("resize", measure);
    };
  }, [id, enabled]);

  return enabled ? box : null;
}
