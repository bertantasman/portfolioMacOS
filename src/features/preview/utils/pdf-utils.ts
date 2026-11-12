import type { PdfErrorReason, ZoomMode, PageSize } from "../types/preview";

export const MIN_ZOOM = 50;
export const MAX_ZOOM = 200;
export const ZOOM_STEP = 25;
export const PAGE_PADDING = 24;
export const PAGE_GAP = 12;

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | undefined;

/**
 * Loads PDF.js on demand, in the browser only (the library touches DOM APIs at
 * import time). The worker is bundled with the app from the installed package,
 * so it always matches the library version and nothing is fetched from a CDN.
 */
export function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return pdfjs;
  });
  return pdfjsPromise;
}

/** Maps PDF.js errors to a small set of user-facing reasons (never raw messages or stacks). */
export function classifyPdfError(error: unknown): PdfErrorReason {
  const name = error instanceof Error ? error.name : "";
  if (name === "MissingPDFException") return "missing";
  if (name === "InvalidPDFException" || name === "FormatError") return "invalid";
  // PDF.js reports HTTP failures as ResponseException (with `status` and `missing`).
  const response = error as { status?: unknown; missing?: unknown };
  if (response.missing === true || response.status === 404) return "missing";
  if (typeof response.status === "number") return "network";
  if (error instanceof TypeError) return "network";
  return "unknown";
}

export const errorDetail: Record<PdfErrorReason, string> = {
  missing: "The document file wasn't found.",
  invalid: "The file isn't a valid PDF.",
  network: "The file couldn't be downloaded.",
  unknown: "Something went wrong while opening it.",
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** CSS pixels per PDF point for the zoom mode, given the viewer's size and the current page. */
export function computeScale(
  zoom: ZoomMode,
  viewer: { width: number; height: number },
  page: PageSize | undefined,
): number {
  if (zoom.kind === "custom") return zoom.percent / 100;
  if (!page || viewer.width === 0) return 1;
  const fitWidth = (viewer.width - PAGE_PADDING * 2) / page.width;
  if (zoom.kind === "fit-width") return Math.max(fitWidth, 0.1);
  const fitHeight = (viewer.height - PAGE_PADDING * 2) / page.height;
  return Math.max(Math.min(fitWidth, fitHeight), 0.1);
}

/** The next zoom stop above/below the current percentage, kept within 50–200%. */
export function nextZoomPercent(currentPercent: number, direction: 1 | -1): number {
  const steps: number[] = [];
  for (let p = MIN_ZOOM; p <= MAX_ZOOM; p += ZOOM_STEP) steps.push(p);
  const next =
    direction === 1
      ? steps.find((s) => s > currentPercent + 0.5)
      : [...steps].reverse().find((s) => s < currentPercent - 0.5);
  return next ?? (direction === 1 ? MAX_ZOOM : MIN_ZOOM);
}

/** Prints the PDF itself (not the desktop) through a hidden same-origin frame. */
export function printPdf(src: string): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
  const cleanup = () => frame.remove();
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      // Some browsers block printing from a frame; show the PDF itself so it can be printed there.
      window.open(src, "_blank", "noopener");
    }
    setTimeout(cleanup, 60_000);
  };
  frame.src = src;
  document.body.appendChild(frame);
}
