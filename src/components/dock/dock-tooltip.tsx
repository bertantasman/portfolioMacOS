export type TooltipAlign = "start" | "center" | "end";

// On narrow screens the first/last tooltips anchor to their icon's edge so
// they cannot be clipped by the viewport; from sm up they are always centred.
const alignClasses: Record<TooltipAlign, string> = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0 sm:left-1/2 sm:-translate-x-1/2",
  end: "right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
};

/**
 * Shown by the parent's `group` on hover, or on keyboard focus while the
 * pointer is away, so at most one tooltip is visible. Purely visual: the
 * accessible name comes from the control itself.
 */
export function DockTooltip({
  label,
  align = "center",
}: {
  label: string;
  align?: TooltipAlign;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute bottom-full mb-2.5 rounded-md border border-white/15 bg-neutral-800/65 px-3 py-1 text-[13px] leading-tight whitespace-nowrap text-white opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.3)] backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-100 group-hover:opacity-100 [nav:not(:hover)_li:has(:focus-visible)_&]:opacity-100 ${alignClasses[align]}`}
    >
      {label}
    </span>
  );
}
