import type { PointerEvent } from "react";
import { WindowControls } from "./window-controls";

interface WindowTitleBarProps {
  titleId: string;
  title: string;
  isFocused: boolean;
  isMaximized: boolean;
  canMaximize: boolean;
  compact?: boolean;
  dragHandlers: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  };
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  layoutWindowId?: string;
}

export function WindowTitleBar({
  titleId,
  title,
  isFocused,
  isMaximized,
  canMaximize,
  compact = false,
  dragHandlers,
  onClose,
  onMinimize,
  onToggleMaximize,
  layoutWindowId,
}: WindowTitleBarProps) {
  return (
    <header
      {...dragHandlers}
      onDoubleClick={(e) => {
        if (canMaximize && !(e.target as HTMLElement).closest("button")) onToggleMaximize();
      }}
      className={`relative flex ${compact ? "h-12 px-2" : "h-10 px-3.5"} shrink-0 touch-none items-center border-b border-black/10 select-none ${
        isMaximized || compact ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      } ${isFocused ? "bg-titlebar" : "bg-titlebar-inactive"}`}
    >
      <WindowControls
        layoutWindowId={layoutWindowId}
        isFocused={isFocused}
        isMaximized={isMaximized}
        canMaximize={canMaximize}
        compact={compact}
        onClose={onClose}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
      />
      <h2
        id={titleId}
        className={`pointer-events-none absolute inset-x-[84px] truncate text-center text-[13px] font-semibold ${
          isFocused ? "text-black/80" : "text-black/40"
        }`}
      >
        {title}
      </h2>
    </header>
  );
}
