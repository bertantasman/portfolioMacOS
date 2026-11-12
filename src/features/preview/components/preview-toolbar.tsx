import {
  ChevronDown,
  ChevronUp,
  Download,
  Maximize,
  MoveHorizontal,
  PanelLeft,
  Printer,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";

interface PreviewToolbarProps {
  title: string;
  /** Extra left padding so controls clear the traffic lights when the sidebar is hidden. */
  clearTrafficLights: boolean;
  sidebarOpen: boolean;
  ready: boolean;
  page: number;
  numPages: number;
  percent: number;
  hasPrevious: boolean;
  hasNext: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  /** Download is also unavailable for documents marked non-downloadable. */
  downloadHref?: string;
  downloadName: string;
  onToggleSidebar: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitPage: () => void;
  onFitWidth: () => void;
  onPrint: () => void;
}

const button =
  "grid h-7 min-w-7 shrink-0 place-items-center rounded-md px-1 text-black/65 outline-none enabled:hover:bg-black/5 enabled:active:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--accent) aria-disabled:text-black/25 disabled:text-black/25";

export function PreviewToolbar(p: PreviewToolbarProps) {
  const download = p.ready && p.downloadHref;
  return (
    <WindowDragArea
      className={`flex h-[52px] shrink-0 items-center gap-0.5 border-b border-black/10 bg-surface-2 pr-3 ${
        p.clearTrafficLights ? "pl-[84px]" : "pl-3"
      }`}
    >
      <button type="button" aria-label="Show thumbnails" aria-pressed={p.sidebarOpen} onClick={p.onToggleSidebar} className={`${button} ${p.sidebarOpen ? "bg-black/[0.07]" : ""}`}>
        <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>

      <h1 className="mx-2 min-w-0 flex-1 truncate text-[13px] font-semibold text-black/85 @max-[760px]:hidden">{p.title}</h1>
      <div className="flex-1 @min-[761px]:hidden" />

      <button type="button" aria-label="Previous page" disabled={!p.ready || !p.hasPrevious} onClick={p.onPrevious} className={button}>
        <ChevronUp className="size-[18px]" strokeWidth={2} aria-hidden />
      </button>
      <span aria-live="polite" className="min-w-[78px] text-center text-[12px] text-black/60 tabular-nums @max-[640px]:min-w-0">
        {p.ready ? (
          <>
            <span className="@max-[640px]:hidden">Page </span>
            {p.page}
            <span className="@max-[640px]:hidden"> of </span>
            <span className="hidden @max-[640px]:inline">/</span>
            {p.numPages}
          </>
        ) : (
          "—"
        )}
      </span>
      <button type="button" aria-label="Next page" disabled={!p.ready || !p.hasNext} onClick={p.onNext} className={button}>
        <ChevronDown className="size-[18px]" strokeWidth={2} aria-hidden />
      </button>

      <span className="mx-1 h-4 w-px bg-black/10" aria-hidden />
      <button type="button" aria-label="Zoom out" disabled={!p.ready || !p.canZoomOut} onClick={p.onZoomOut} className={button}>
        <ZoomOut className="size-[17px]" strokeWidth={1.75} aria-hidden />
      </button>
      <span className="min-w-[40px] text-center text-[12px] text-black/60 tabular-nums" aria-label={`Zoom ${p.percent}%`}>
        {p.ready ? `${p.percent}%` : "—"}
      </span>
      <button type="button" aria-label="Zoom in" disabled={!p.ready || !p.canZoomIn} onClick={p.onZoomIn} className={button}>
        <ZoomIn className="size-[17px]" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Fit to page" disabled={!p.ready} onClick={p.onFitPage} className={`${button} @max-[600px]:hidden`}>
        <Maximize className="size-[16px]" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Fit to width" disabled={!p.ready} onClick={p.onFitWidth} className={`${button} @max-[600px]:hidden`}>
        <MoveHorizontal className="size-[17px]" strokeWidth={1.75} aria-hidden />
      </button>

      <span className="mx-1 h-4 w-px bg-black/10" aria-hidden />
      {download ? (
        // A plain link to the original file: the browser downloads the unmodified PDF.
        <a href={p.downloadHref} download={p.downloadName} aria-label={`Download ${p.downloadName}`} className={button}>
          <Download className="size-[17px]" strokeWidth={1.75} aria-hidden />
        </a>
      ) : (
        <button type="button" disabled aria-label="Download (unavailable)" title="This document can't be downloaded." className={button}>
          <Download className="size-[17px]" strokeWidth={1.75} aria-hidden />
        </button>
      )}
      <button type="button" aria-label="Print" disabled={!p.ready} onClick={p.onPrint} className={button}>
        <Printer className="size-[17px]" strokeWidth={1.75} aria-hidden />
      </button>
    </WindowDragArea>
  );
}
