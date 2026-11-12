"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useWindowChrome } from "@/components/windows/window-chrome";
import { getProjectById } from "@/lib/projects/registry";
import { PhotoImage } from "@/features/photos/components/photo-image";
import type { PortfolioMedia } from "@/types/media";

interface InstagramMediaViewerProps {
  items: readonly PortfolioMedia[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
}

/** Large preview inside the Instagram window. Keys work while focus is inside it. */
export function InstagramMediaViewer({ items, index, onIndexChange, onClose, onOpenProject }: InstagramMediaViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const media = items[index];

  const { isFocused } = useWindowChrome();

  // Keep keyboard focus inside the viewer whenever this window is the active one,
  // including after returning from another window.
  useEffect(() => {
    if (isFocused) closeRef.current?.focus();
  }, [isFocused]);

  if (!media) return null;
  const project = media.projectId ? getProjectById(media.projectId) : undefined;
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
    else if (e.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
  };

  const nav =
    "absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-(--accent) disabled:hidden";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={media.title}
      onKeyDown={onKeyDown}
      className="absolute inset-0 z-30 flex flex-col bg-[rgb(0_0_0/0.88)] text-white"
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close viewer"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-white/15 outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="relative min-h-0 flex-1">
        <button type="button" aria-label="Previous photo" disabled={!hasPrev} onClick={() => onIndexChange(index - 1)} className={`${nav} left-3`}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <PhotoImage
            key={media.id}
            media={media}
            sizes="90vw"
            className="h-auto max-h-full w-auto max-w-full rounded-sm object-contain"
          />
        </div>
        <button type="button" aria-label="Next photo" disabled={!hasNext} onClick={() => onIndexChange(index + 1)} className={`${nav} right-3`}>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3 text-[13px]">
        <div className="min-w-0">
          <p className="truncate font-semibold">{media.title}</p>
          {media.description && <p className="line-clamp-2 text-white/65">{media.description}</p>}
        </div>
        {project && (
          <button
            type="button"
            onClick={() => onOpenProject(project.id)}
            className="h-7 shrink-0 rounded-md bg-white/15 px-3 text-[12px] font-medium outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
          >
            View Project
          </button>
        )}
      </div>
    </div>
  );
}
