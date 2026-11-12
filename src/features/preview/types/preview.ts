import type { PDFDocumentProxy } from "pdfjs-dist";

export type ZoomMode =
  | { kind: "fit-page" }
  | { kind: "fit-width" }
  | { kind: "custom"; percent: number };

/** A page's size in PDF points at 100%. */
export interface PageSize {
  width: number;
  height: number;
}

export type PdfErrorReason = "missing" | "invalid" | "network" | "unknown";

export type PdfState =
  | { status: "loading" }
  | { status: "ready"; pdf: PDFDocumentProxy; pages: readonly PageSize[] }
  | { status: "error"; reason: PdfErrorReason };
