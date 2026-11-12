import { ChevronLeft, ChevronRight, Image as ImageIcon, Info, PanelLeft, Search } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";

export const THUMBNAIL_SIZES = [
  { label: "Small", px: 90 },
  { label: "Medium", px: 130 },
  { label: "Large", px: 190 },
] as const;

interface PhotosToolbarProps {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** Present in the detail view. */
  detail?: {
    canGoPrevious: boolean;
    canGoNext: boolean;
    infoOpen: boolean;
    onBack: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onToggleInfo: () => void;
  };
  sizeIndex: number;
  onSizeChange: (index: number) => void;
}

const button =
  "grid h-7 min-w-8 shrink-0 place-items-center rounded-md px-1 text-black/60 outline-none enabled:hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:text-black/25";

export function PhotosToolbar({
  title,
  sidebarOpen,
  onToggleSidebar,
  detail,
  sizeIndex,
  onSizeChange,
}: PhotosToolbarProps) {
  return (
    <WindowDragArea
      className={`flex h-[52px] shrink-0 items-center gap-1 border-b border-black/10 bg-surface/80 pr-3 ${
        sidebarOpen ? "pl-3" : "pl-[84px] @max-[520px]:pl-[92px]"
      }`}
    >
      <button
        type="button"
        aria-label="Show sidebar"
        aria-pressed={sidebarOpen}
        onClick={onToggleSidebar}
        className={`${button} ${sidebarOpen ? "bg-black/[0.07]" : ""}`}
      >
        <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>

      {detail && (
        <button type="button" onClick={detail.onBack} className={`${button} gap-0.5 pr-2 text-[13px]`}>
          <span className="flex items-center">
            <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
            Library
          </span>
        </button>
      )}

      <h1 className="mr-auto ml-2 min-w-0 truncate pr-2 text-[15px] font-semibold text-black/85">{title}</h1>

      {detail ? (
        <>
          <button type="button" aria-label="Previous photo" disabled={!detail.canGoPrevious} onClick={detail.onPrevious} className={button}>
            <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
          <button type="button" aria-label="Next photo" disabled={!detail.canGoNext} onClick={detail.onNext} className={button}>
            <ChevronRight className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Show info"
            aria-pressed={detail.infoOpen}
            onClick={detail.onToggleInfo}
            className={`${button} ${detail.infoOpen ? "bg-black/[0.07]" : ""}`}
          >
            <Info className="size-[17px]" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      ) : (
        <label className="flex items-center gap-1.5 text-black/45 @max-[560px]:hidden">
          <ImageIcon className="size-3" aria-hidden />
          <input
            type="range"
            min={0}
            max={THUMBNAIL_SIZES.length - 1}
            step={1}
            value={sizeIndex}
            aria-label="Thumbnail size"
            aria-valuetext={THUMBNAIL_SIZES[sizeIndex].label}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="h-1 w-20 accent-(--accent)"
          />
          <ImageIcon className="size-4" aria-hidden />
        </label>
      )}
      {/* Not implemented yet: shown disabled instead of pretending to work. */}
      <button type="button" aria-label="Search" disabled className={`${button} @max-[560px]:hidden`}>
        <Search className="size-4" aria-hidden />
      </button>
    </WindowDragArea>
  );
}
