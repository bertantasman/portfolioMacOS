import type { PDFDocumentProxy } from "pdfjs-dist";
import { WindowDragArea } from "@/components/windows/window-chrome";
import type { PageSize } from "../types/preview";
import { PDFThumbnail } from "./pdf-thumbnail";

interface PreviewSidebarProps {
  /** Present once the document has loaded. */
  pdf?: PDFDocumentProxy;
  pages: readonly PageSize[];
  current: number;
  onSelect: (page: number) => void;
}

export function PreviewSidebar({ pdf, pages, current, onSelect }: PreviewSidebarProps) {
  return (
    <aside aria-label="Page thumbnails" className="flex w-[136px] shrink-0 flex-col border-r border-black/10 bg-sidebar/70">
      {/* Room for the traffic lights floating over this corner. */}
      <WindowDragArea className="h-[52px] shrink-0" />
      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-4">
        {pdf &&
          pages.map((size, i) => {
            const selected = current === i + 1;
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => onSelect(i + 1)}
                  className="flex w-full flex-col items-center gap-1 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                >
                  <span className={`rounded-[2px] ${selected ? "ring-[3px] ring-(--accent)" : ""}`}>
                    <PDFThumbnail pdf={pdf} pageNumber={i + 1} size={size} />
                  </span>
                  <span
                    className={`rounded-full px-1.5 text-[11px] ${selected ? "bg-(--accent) text-(--accent-fg)" : "text-black/55"}`}
                  >
                    {i + 1}
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
