"use client";

import { useEffect, useRef } from "react";
import { Monitor, X } from "lucide-react";
import { siteConfig } from "@/config/site";

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div className="pointer-events-none fixed inset-0 z-(--z-overlay) flex items-center justify-center p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="pointer-events-auto relative flex w-72 flex-col items-center gap-1 rounded-xl border border-white/15 bg-neutral-900/70 px-6 pt-8 pb-6 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2.5 left-2.5 grid size-5 place-items-center rounded-full text-white/60 outline-none hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="size-3.5" aria-hidden />
        </button>
        <Monitor className="mb-2 size-14 stroke-1" aria-hidden />
        <h2 id="about-title" className="text-base font-semibold">
          {siteConfig.title}
        </h2>
        <p className="text-xs text-white/60">{siteConfig.description}</p>
        <p className="mt-3 text-[11px] text-white/45">
          Built with Next.js, React, TypeScript and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
