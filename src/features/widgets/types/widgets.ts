import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type WidgetSize = "small" | "medium" | "large";

/** A kind of widget: what it is and which sizes it supports. */
export interface WidgetDefinition {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  supportedSizes: readonly WidgetSize[];
  defaultSize: WidgetSize;
}

/** One widget placed on the desktop. Column and row are the preferred grid position (from the top left). */
export interface WidgetInstance {
  id: string;
  type: string;
  size: WidgetSize;
  column: number;
  row: number;
}

export interface WidgetProps {
  /** The size being drawn (which may be smaller than the saved size on a small screen). */
  size: WidgetSize;
  /** A gallery preview: static, nothing inside reacts. */
  preview?: boolean;
}

export type WidgetComponent = ComponentType<WidgetProps>;

export interface WidgetPreferences {
  /** City the Weather widget shows. Only the name is saved. */
  weatherCity?: string;
}
