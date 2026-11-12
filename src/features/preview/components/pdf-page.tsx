"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PDFPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  totalPages: number;
  /** CSS size of the page at the current zoom. */
  width: number;
  height: number;
  /** CSS pixels per PDF point. */
  scale: number;
}

const isCancel = (error: unknown) => error instanceof Error && error.name === "RenderingCancelledException";

/**
 * One page. The box is sized up front, so scrolling never jumps, but pixels are
 * only drawn once the page is near the viewport, and are redrawn crisply when
 * the zoom changes. The page is always white: the theme never recolours a PDF.
 */
export function PDFPage({ pdf, pageNumber, totalPages, width, height, scale }: PDFPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const gotText = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let task: { cancel: () => void; promise: Promise<unknown> } | undefined;
    // Wait briefly so a burst of zoom/resize changes draws once.
    const timer = setTimeout(async () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * ratio });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        task = page.render({ canvas, canvasContext: context, viewport });
        await task.promise;
        if (!gotText.current) {
          gotText.current = true;
          const content = await page.getTextContent();
          setText(content.items.map((item) => ("str" in item ? item.str : "")).join(" ").trim());
        }
      } catch (error) {
        if (!isCancel(error) && process.env.NODE_ENV !== "production") {
          console.warn(`[preview] Could not render page ${pageNumber}.`);
        }
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      task?.cancel();
    };
  }, [visible, pdf, pageNumber, scale]);

  return (
    <div
      ref={wrapperRef}
      role="group"
      aria-label={`Page ${pageNumber} of ${totalPages}`}
      style={{ width, height }}
      className="relative shrink-0 bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_2px_10px_rgba(0,0,0,0.3)]"
    >
      {/* The canvas is a picture; the page's text is provided below for screen readers. */}
      <canvas ref={canvasRef} aria-hidden style={{ width, height }} className="block" />
      {text && <p className="sr-only">{text}</p>}
    </div>
  );
}
