import type { ReactNode } from "react";
import { widgetPixelSize } from "../utils/widget-layout";
import type { WidgetSize } from "../types/widgets";

/** The translucent rounded surface every widget (and gallery preview) sits on. Follows the theme tokens. */
export const widgetSurfaceClass =
  "overflow-hidden rounded-[22px] border border-black/10 bg-[color-mix(in_srgb,var(--surface-primary)_62%,transparent)] text-black shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150";

export function WidgetSurface({ size, children, className = "" }: { size: WidgetSize; children: ReactNode; className?: string }) {
  const { width, height } = widgetPixelSize(size);
  return (
    <div className={`${widgetSurfaceClass} ${className}`} style={{ width, height }}>
      {children}
    </div>
  );
}
