import type { SettingsPageId } from "@/features/settings/lib/pages";
import type { ApplicationId } from "@/types/application";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Bounds = Point & Size;

/** Tiled layouts other than Fill. Fill is the existing maximized state, so there is one fill behaviour. */
export type WindowSnapPosition = "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Anything a window can be snapped to, including Fill. */
export type SnapTarget = WindowSnapPosition | "fill";

export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * "standard": generic title bar above the content.
 * "unified": no title bar; the content fills the window, the traffic lights
 * float over its top-left corner, and the content provides its own drag
 * regions with <WindowDragArea>.
 */
export type WindowAppearance = "light" | "dark";

export type TitleBarStyle = "standard" | "unified";

/**
 * Data a window carries for its application. Applications that open documents
 * (like the Project Viewer) read what to show from here, so each window shows
 * its own document.
 */
export type WindowPayload =
  | { type: "application" }
  | { type: "project"; projectId: string }
  /** `requestId` changes on every request so an open Photos window can react even to the same image. */
  | { type: "media"; mediaId: string; requestId: number }
  /** Finder: go to a folder, optionally selecting an item in it. */
  | { type: "folder"; folderId: string; selectId?: string; requestId: number }
  /** Notes: show a note in its folder. */
  | { type: "note"; noteId: string; requestId: number }
  /** Preview: which document this window shows. One window per document. */
  | { type: "document"; documentId: string }
  /** Mail: optionally start a new message. */
  | { type: "mail"; compose: boolean; requestId: number }
  /** System Settings: show a section. */
  | { type: "settings"; page: SettingsPageId; requestId: number }
  /** Safari: show an internal page, optionally scrolled to one of its sections. */
  | { type: "safari"; route: string; section?: string; requestId: number }
  /** Get Info: which virtual file system item this window describes. One window per item. */
  | { type: "info"; fileId: string };

export interface WindowState {
  /** Stable unique identifier, never an array index. */
  id: string;
  appId: ApplicationId;
  title: string;
  /** Relative to the window workspace (the area below the menu bar). */
  position: Point;
  size: Size;
  minSize: Size;
  maxSize?: Size;
  resizable: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  /** Rank in 1..n among open windows (renumbered, so it never grows unbounded). */
  zIndex: number;
  /** The tiled layout this window is in, if any. The geometry in position/size follows it. */
  snap?: WindowSnapPosition;
  /** The floating bounds to return to from a snap or from maximized. Never overwritten while moving between snaps. */
  previousBounds?: Bounds;
  titleBar: TitleBarStyle;
  appearance: WindowAppearance;
  payload: WindowPayload;
}

/** Per-application window defaults, declared in the application registry. */
export interface ApplicationWindowConfig {
  title?: string;
  defaultSize: Size;
  minSize: Size;
  resizable?: boolean;
  titleBar?: TitleBarStyle;
  appearance?: WindowAppearance;
}
