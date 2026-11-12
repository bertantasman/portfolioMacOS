"use client";

import { useEffect, useRef, useState } from "react";
import { WindowDragArea, useWindowChrome } from "@/components/windows/window-chrome";
import { getDocumentById, isSafeDocumentPath, type PortfolioDocument } from "@/data/documents";
import { notify } from "@/lib/notify";
import { useElementSize } from "../hooks/use-element-size";
import { usePDFDocument } from "../hooks/use-pdf-document";
import { usePreviewNavigation } from "../hooks/use-preview-navigation";
import { errorDetail, printPdf } from "../utils/pdf-utils";
import { PDFViewer } from "./pdf-viewer";
import { PreviewEmptyState } from "./preview-empty-state";
import { PreviewErrorState } from "./preview-error-state";
import { PreviewSidebar } from "./preview-sidebar";
import { PreviewToolbar } from "./preview-toolbar";

/** One Preview window. `documentId` comes from the window's payload, so each window shows its own document. */
export function PreviewApp({ documentId }: { documentId: string }) {
  const doc = getDocumentById(documentId);
  if (!doc || !isSafeDocumentPath(doc.src)) {
    return (
      <div className="flex size-full flex-col bg-surface text-black">
        <WindowDragArea className="h-[52px] shrink-0 border-b border-black/10 bg-surface-2" />
        <div className="min-h-0 flex-1">
          <PreviewErrorState title="Document Not Found" message="That document isn't available in Preview." />
        </div>
      </div>
    );
  }
  return <PreviewDocument key={doc.id} doc={doc} />;
}

function PreviewDocument({ doc }: { doc: PortfolioDocument }) {
  const { isFocused } = useWindowChrome();
  const state = usePDFDocument(doc.src);
  // `areaRef` is a stable wrapper that is measured; `scrollRef` is the scrolling element inside it.
  const areaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewerSize = useElementSize(areaRef);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ready = state.status === "ready";
  const pages = ready ? state.pages : [];
  const nav = usePreviewNavigation(pages, viewerSize);
  const { scale, percent } = nav;

  // A failed load is a meaningful event worth one notification.
  const failed = state.status === "error";
  useEffect(() => {
    if (!failed) return;
    notify({
      appId: "preview",
      title: "Unable to Open Document",
      message: `${doc.filename} could not be loaded.`,
      dedupeKey: `preview-error-${doc.id}`,
    });
  }, [failed, doc.id, doc.filename]);

  const downloadable = doc.downloadable !== false;

  // Shortcuts apply only while this window is the active one.
  useEffect(() => {
    if (!isFocused || !ready) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod && !e.altKey && e.key === "ArrowLeft" && nav.hasPrevious) nav.goToPage(nav.page - 1);
      else if (!mod && !e.altKey && e.key === "ArrowRight" && nav.hasNext) nav.goToPage(nav.page + 1);
      else if (mod && (e.key === "+" || e.key === "=")) nav.zoomIn();
      else if (mod && (e.key === "-" || e.key === "_")) nav.zoomOut();
      else if (mod && e.key === "0") nav.fitPage();
      else if (mod && e.key.toLowerCase() === "p") printPdf(doc.src);
      else return; // not ours: leave the browser's behaviour alone
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="@container flex size-full bg-surface text-black">
      {sidebarOpen && (
        <PreviewSidebar
          pdf={ready ? state.pdf : undefined}
          pages={pages}
          current={nav.page}
          onSelect={nav.goToPage}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <PreviewToolbar
          title={doc.filename}
          clearTrafficLights={!sidebarOpen}
          sidebarOpen={sidebarOpen}
          ready={ready}
          page={nav.page}
          numPages={pages.length}
          percent={percent}
          hasPrevious={nav.hasPrevious}
          hasNext={nav.hasNext}
          canZoomIn={percent < 200}
          canZoomOut={percent > 50}
          downloadHref={downloadable ? doc.src : undefined}
          downloadName={doc.filename}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onPrevious={() => nav.goToPage(nav.page - 1)}
          onNext={() => nav.goToPage(nav.page + 1)}
          onZoomIn={nav.zoomIn}
          onZoomOut={nav.zoomOut}
          onFitPage={nav.fitPage}
          onFitWidth={nav.fitWidth}
          onPrint={() => printPdf(doc.src)}
        />
        <div ref={areaRef} className="flex min-h-0 flex-1 flex-col bg-black/[0.14]">
          {state.status === "ready" ? (
            <PDFViewer
              pdf={state.pdf}
              pages={state.pages}
              scale={scale}
              page={nav.page}
              scrollRequest={nav.scrollRequest}
              scrollRef={scrollRef}
              onVisiblePageChange={nav.setVisiblePage}
            />
          ) : state.status === "loading" ? (
            <PreviewEmptyState title={doc.filename} />
          ) : (
            <PreviewErrorState detail={errorDetail[state.reason]} />
          )}
        </div>
      </div>
    </div>
  );
}
