"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageSize } from "../types/preview";

export const THUMBNAIL_WIDTH = 96;

interface PDFThumbnailProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  size: PageSize;
}

/** A small preview, rendered once when scrolled into view (never at full document resolution). */
export function PDFThumbnail({ pdf, pageNumber, size }: PDFThumbnailProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const height = Math.round((size.height / size.width) * THUMBNAIL_WIDTH);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: "300px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let task: { cancel: () => void; promise: Promise<unknown> } | undefined;
    (async () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: (THUMBNAIL_WIDTH / size.width) * ratio });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        task = page.render({ canvas, canvasContext: context, viewport });
        await task.promise;
      } catch {
        /* cancelled or failed: the blank thumbnail stays */
      }
    })();
    return () => task?.cancel();
  }, [visible, pdf, pageNumber, size.width]);

  return (
    <span
      ref={wrapperRef}
      style={{ width: THUMBNAIL_WIDTH, height }}
      className="block bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.25)]"
    >
      <canvas ref={canvasRef} aria-hidden style={{ width: THUMBNAIL_WIDTH, height }} className="block" />
    </span>
  );
}
