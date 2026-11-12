"use client";

import { createContext, useContext } from "react";
import type { PointerEvent, ReactNode } from "react";

export interface WindowChrome {
  isFocused: boolean;
  canMaximize: boolean;
  dragHandlers: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  };
  onToggleMaximize: () => void;
  onClose: () => void;
}

export const WindowChromeContext = createContext<WindowChrome | null>(null);

export function useWindowChrome(): WindowChrome {
  const chrome = useContext(WindowChromeContext);
  if (!chrome) throw new Error("useWindowChrome must be used inside a window");
  return chrome;
}

/**
 * A region of a unified-title-bar window that moves the window when dragged
 * and toggles maximize on double-click. Buttons inside it keep working.
 */
export function WindowDragArea({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { dragHandlers, canMaximize, onToggleMaximize } = useWindowChrome();
  return (
    <div
      {...dragHandlers}
      onDoubleClick={(e) => {
        if (canMaximize && e.target === e.currentTarget) onToggleMaximize();
      }}
      className={`touch-none select-none ${className}`}
    >
      {children}
    </div>
  );
}
