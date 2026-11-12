"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { ProjectScreenshot } from "@/types/project";
import { Section } from "./section";

const STAGE_HEIGHT = 340;

const altFor = (shot: ProjectScreenshot, index: number, title: string) =>
  shot.alt ?? `${title} screenshot ${index + 1}`;

export function ProjectGallery({
  id,
  title,
  screenshots,
  onOpenInPhotos,
}: {
  id?: string;
  title: string;
  screenshots: readonly ProjectScreenshot[];
  /** When provided, shows an "Open in Photos" action for the current screenshot. */
  onOpenInPhotos?: (mediaId: string) => void;
}) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const stageRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);

  // Screenshots that fail to load are dropped instead of showing broken images.
  const shots = screenshots.filter((s) => !failed.has(s.src));
  const index = Math.min(selected, Math.max(shots.length - 1, 0));
  const current = shots[index];

  const go = (delta: number) => {
    const n = shots.length;
    if (n === 0) return;
    setSelected((i) => (Math.min(i, n - 1) + delta + n) % n);
  };

  // Keep the selected thumbnail in view by scrolling only the thumbnail strip
  // (scrollIntoView would also scroll the whole viewer).
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2 });
  }, [index]);

  if (!current) return null;
  const multiple = shots.length > 1;
  const markFailed = (src: string) => setFailed((prev) => new Set(prev).add(src));

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multiple) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const arrow =
    "absolute top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-raised/85 text-black/70 shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.2)] outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-(--accent)";

  return (
    <Section title="Screenshots" id={id}>
      <div role="group" aria-roledescription="carousel" aria-label={`${title} screenshots`} onKeyDown={onKeyDown}>
        <div className="relative flex justify-center rounded-lg bg-black/[0.04] p-3">
          {multiple && (
            <button type="button" aria-label="Previous screenshot" onClick={() => go(-1)} className={`${arrow} left-2`}>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          )}
          <button
            ref={stageRef}
            type="button"
            aria-label={`Enlarge: ${altFor(current, index, title)}`}
            onClick={() => setPreviewOpen(true)}
            className="relative block cursor-zoom-in rounded-md outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
            // Width follows the screenshot's own ratio, so portrait and landscape both fit with no layout shift.
            style={{
              aspectRatio: current.width / current.height,
              width: `min(100%, ${STAGE_HEIGHT * (current.width / current.height)}px)`,
            }}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={altFor(current, index, title)}
              fill
              quality={90}
              sizes="(max-width: 900px) 90vw, 720px"
              onError={() => markFailed(current.src)}
              className="rounded-md object-contain shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
            />
          </button>
          {multiple && (
            <button type="button" aria-label="Next screenshot" onClick={() => go(1)} className={`${arrow} right-2`}>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {current.caption && <p className="mt-2 text-center text-[12px] text-black/60">{current.caption}</p>}
        {onOpenInPhotos && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenInPhotos(current.mediaId)}
              className="flex h-6 items-center gap-1.5 rounded-md px-2 text-[12px] text-black/65 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              <Images className="size-3.5" aria-hidden />
              Open in Photos
            </button>
          </div>
        )}

        {multiple && (
          <ul ref={thumbsRef} className="relative mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Choose screenshot">
            {shots.map((shot, i) => (
              <li key={shot.src} data-index={i} className="shrink-0">
                <button
                  type="button"
                  aria-label={`Show ${altFor(shot, i, title)}`}
                  aria-current={i === index}
                  onClick={() => setSelected(i)}
                  className={`relative block h-14 overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                    i === index ? "ring-2 ring-(--accent)" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ aspectRatio: shot.width / shot.height }}
                >
                  <Image
                    src={shot.src}
                    alt=""
                    fill
                    loading="lazy"
                    quality={90}
                    sizes="120px"
                    onError={() => markFailed(shot.src)}
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {previewOpen && (
        <ScreenshotPreview
          shot={current}
          alt={altFor(current, index, title)}
          multiple={multiple}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          onClose={() => {
            setPreviewOpen(false);
            // Return focus to what opened the preview.
            requestAnimationFrame(() => stageRef.current?.focus());
          }}
        />
      )}
    </Section>
  );
}

/** Fills the Project Viewer window (nearest positioned ancestor), not the page. */
function ScreenshotPreview({
  shot,
  alt,
  multiple,
  onPrev,
  onNext,
  onClose,
}: {
  shot: ProjectScreenshot;
  alt: string;
  multiple: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (multiple && e.key === "ArrowLeft") onPrev();
    else if (multiple && e.key === "ArrowRight") onNext();
  };

  const nav =
    "absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-raised/85 text-black/70 outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-(--accent)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("button, img")) onClose();
      }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[rgb(0_0_0/0.55)] p-10 backdrop-blur-sm"
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-raised/85 text-black/70 outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <X className="size-4" aria-hidden />
      </button>
      {multiple && (
        <>
          <button type="button" aria-label="Previous screenshot" onClick={onPrev} className={`${nav} left-3`}>
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" aria-label="Next screenshot" onClick={onNext} className={`${nav} right-3`}>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </>
      )}
      <div className="pointer-events-none flex size-full flex-col items-center justify-center gap-2">
        <Image
          src={shot.src}
          alt={alt}
          width={shot.width}
          height={shot.height}
          quality={90}
          sizes="90vw"
          className="pointer-events-auto h-auto max-h-full w-auto max-w-full rounded-md object-contain shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
