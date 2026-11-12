"use client";

import { useId } from "react";
import type { WidgetSize } from "../types/widgets";

const labels: Record<WidgetSize, string> = { small: "Small", medium: "Medium", large: "Large" };

/** Radio choice among the sizes a widget supports. Unsupported sizes are never listed. */
export function WidgetSizeSelector({ sizes, value, onChange }: { sizes: readonly WidgetSize[]; value: WidgetSize; onChange: (size: WidgetSize) => void }) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label="Widget size" className="inline-flex gap-0.5 rounded-lg bg-black/[0.07] p-0.5">
      {sizes.map((size) => (
        <label
          key={size}
          className={`cursor-pointer rounded-md px-3 py-1 text-[12px] has-focus-visible:ring-2 has-focus-visible:ring-(--accent) ${
            value === size ? "bg-raised text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]" : "text-black/65 hover:bg-black/[0.05]"
          }`}
        >
          <input type="radio" name={name} value={size} checked={value === size} onChange={() => onChange(size)} className="sr-only" />
          {labels[size]}
        </label>
      ))}
    </div>
  );
}
