import type { ApplicationId } from "@/types/application";

/** One window in the overview. Everything here is read from the window manager's own state. */
export interface OverviewWindow {
  id: string;
  appId: ApplicationId;
  title: string;
  isMinimized: boolean;
  isFocused: boolean;
  /** The window's own size and position, which the preview is scaled from. */
  width: number;
  height: number;
  x: number;
  y: number;
}

/** Where a window's preview sits, in workspace coordinates (the area below the menu bar). */
export interface OverviewSlot {
  x: number;
  y: number;
  /** Size of the scaled window. */
  width: number;
  height: number;
  scale: number;
  /** Width available to the label under the preview. */
  labelWidth: number;
}

export type OverviewLayout = Record<string, OverviewSlot>;

export type Direction = "left" | "right" | "up" | "down";
