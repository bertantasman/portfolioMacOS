"use client";

import { useSyncExternalStore } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { profile } from "@/data/profile";
import { getDocumentById, isPublished, isSafeDocumentPath } from "@/data/documents";
import { AppScreen } from "../components/app-screen";

/**
 * Opens the published résumé PDF (the same file Preview shows on the desktop). Phones differ in how they show an embedded
 * PDF, so the page always offers View and Download as plain links, and the embed is only a convenience.
 */
export default function ResumeApp() {
  // The embedded preview is only offered where the browser has a built-in PDF viewer; the buttons always work.
  const canEmbed = useSyncExternalStore(
    () => () => {},
    () => navigator.pdfViewerEnabled === true,
    () => false,
  );
  const doc = profile.resume ? getDocumentById(profile.resume.documentId) : undefined;
  const available = !!doc && isPublished(doc) && isSafeDocumentPath(doc.src);
  if (!doc || !available) {
    return (
      <AppScreen title="Resume">
        <div role="status" className="py-16 text-center">
          <FileText className="mx-auto mb-3 size-12 text-black/25" aria-hidden />
          <p className="text-[15px] text-black/70">The résumé isn’t available yet.</p>
        </div>
      </AppScreen>
    );
  }
  const button = "flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-(--accent) active:scale-95";
  return (
    <AppScreen title="Resume">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-surface-2 p-4">
          <FileText className="size-9 shrink-0 text-(--accent)" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-black/90">{doc.filename}</p>
            <p className="text-[12px] text-black/55">PDF document</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={doc.src} target="_blank" rel="noopener noreferrer" aria-label="View resume (opens in a new tab)" className={`${button} bg-(--accent) text-(--accent-fg)`}>
            <ExternalLink className="size-4" aria-hidden />
            View Resume
          </a>
          {doc.downloadable !== false && (
            <a href={doc.src} download={doc.filename} className={`${button} bg-black/[0.07] text-black/85`}>
              <Download className="size-4" aria-hidden />
              Download
            </a>
          )}
        </div>
        {canEmbed && <object data={`${doc.src}#view=FitH`} type="application/pdf" aria-label="Resume preview" className="min-h-[360px] w-full flex-1 rounded-xl border border-black/10 bg-surface-2">
          <p className="p-4 text-[14px] text-black/65">Your browser can’t show the PDF here. Use View Resume or Download above.</p>
        </object>}
      </div>
    </AppScreen>
  );
}
