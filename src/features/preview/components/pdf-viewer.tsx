"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageSize } from "../types/preview";
import { PAGE_GAP, PAGE_PADDING } from "../utils/pdf-utils";
import { PDFPage } from "./pdf-page";

interface PDFViewerProps {
  pdf: PDFDocumentProxy;
  pages: readonly PageSize[];
  scale: number;
  page: number;
  scrollRequest: { page: number; id: number };
  scrollRef: RefObject<HTMLDivElement | null>;
  onVisiblePageChange: (page: number) => void;
}

/** Scrolling stack of pages on a neutral background. Page tops are computed, so page tracking needs no measuring. */
export function PDFViewer({ pdf, pages, scale, page, scrollRequest, scrollRef, onVisiblePageChange }: PDFViewerProps) {
  const tops = useMemo(() => {
    const result: number[] = [];
    let y = PAGE_PADDING;
    for (const p of pages) {
      result.push(y);
      y += p.height * scale + PAGE_GAP;
    }
    return result;
  }, [pages, scale]);

  const latest = useRef({ page, tops });
  const programmaticUntil = useRef(0);

  useEffect(() => {
    latest.current = { page, tops };
  });

  const scrollToPage = (n: number) => {
    const el = scrollRef.current;
    const top = latest.current.tops[n - 1];
    if (!el || top === undefined) return;
    programmaticUntil.current = Date.now() + 200;
    el.scrollTop = Math.max(top - PAGE_PADDING, 0);
  };

  // Keep the current page in view when the zoom (or window size) changes.
  useLayoutEffect(() => {
    scrollToPage(latest.current.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // Explicit navigation (buttons, thumbnails, keys).
  useLayoutEffect(() => {
    if (scrollRequest.id > 0) scrollToPage(scrollRequest.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRequest.id]);

  // Follow scrolling with the page indicator.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (Date.now() < programmaticUntil.current) return;
        const probe = el.scrollTop + el.clientHeight * 0.35;
        let index = 0;
        latest.current.tops.forEach((t, i) => {
          if (t <= probe) index = i;
        });
        if (index + 1 !== latest.current.page) onVisiblePageChange(index + 1);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scrollRef, onVisiblePageChange]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-black/[0.14]" tabIndex={0} aria-label="Document pages">
      <div
        className="mx-auto flex w-max min-w-full flex-col items-center"
        style={{ padding: PAGE_PADDING, gap: PAGE_GAP }}
      >
        {pages.map((size, i) => (
          <PDFPage
            key={i}
            pdf={pdf}
            pageNumber={i + 1}
            totalPages={pages.length}
            width={size.width * scale}
            height={size.height * scale}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
}
