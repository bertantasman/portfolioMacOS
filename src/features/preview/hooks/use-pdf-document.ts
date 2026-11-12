"use client";

import { useEffect, useState } from "react";
import type { PdfState } from "../types/preview";
import { classifyPdfError, loadPdfjs } from "../utils/pdf-utils";

/**
 * Loads a PDF once and releases it on unmount. Pass a key-stable `src`; changing
 * documents is done by remounting the viewer with a new key.
 */
export function usePDFDocument(src: string): PdfState {
  const [state, setState] = useState<PdfState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | undefined;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const loading = pdfjs.getDocument({ url: src });
        task = loading;
        const pdf = await loading.promise;
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const viewport = (await pdf.getPage(i + 1)).getViewport({ scale: 1 });
            return { width: viewport.width, height: viewport.height };
          }),
        );
        if (cancelled) {
          void loading.destroy();
          return;
        }
        setState({ status: "ready", pdf, pages });
      } catch (error) {
        if (!cancelled) setState({ status: "error", reason: classifyPdfError(error) });
      }
    })();

    return () => {
      cancelled = true;
      void task?.destroy(); // also frees the document and worker resources
    };
  }, [src]);

  return state;
}
