"use client";

import { useEffect, useRef } from "react";
import { AppWindow } from "lucide-react";

/** Shown when no windows are open. Nothing is invented to fill the space. */
export function MissionControlEmptyState({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div role="status" className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-2 text-center text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <AppWindow className="size-10 opacity-70" strokeWidth={1.5} aria-hidden />
        <p className="text-[20px] font-semibold">No Open Windows</p>
        <p className="max-w-[260px] text-[13px] text-white/75">Open an app from the Dock and it will show up here.</p>
        <button
          ref={ref}
          type="button"
          data-mc-tile
          onClick={onClose}
          className="mt-2 h-7 rounded-md bg-white/20 px-4 text-[13px] text-white outline-none hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/80"
        >
          Close
        </button>
      </div>
    </div>
  );
}
