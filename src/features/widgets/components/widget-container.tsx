"use client";

import { contextMenuProps } from "@/features/context-menu/hooks/use-context-menu";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { getWidgetDefinition } from "../registry/widget-registry";
import type { WidgetInstance, WidgetSize } from "../types/widgets";
import { widgetComponents } from "../widgets";
import { widgetPixelSize, WIDGET_CELL } from "../utils/widget-layout";
import { widgetSurfaceClass } from "./widget-surface";

interface WidgetContainerProps {
  instance: WidgetInstance;
  /** Size actually drawn (smaller than the saved one when the screen is small). */
  size: WidgetSize;
  col: number;
  row: number;
  /** Pixel override while the widget is being dragged. */
  dragAt?: { left: number; top: number };
  moving: boolean;
  /** The first widget is what the onboarding tour points at. */
  onboardingTarget?: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
}

/** One widget on the desktop: its surface, content, drag area, context menu and focus handling. */
export function WidgetContainer({ instance, size, col, row, dragAt, moving, onboardingTarget, onPointerDown }: WidgetContainerProps) {
  const reduced = useShouldReduceMotion();
  const def = getWidgetDefinition(instance.type);
  const Content = widgetComponents[instance.type];
  if (!def || !Content) return null;
  const { width, height } = widgetPixelSize(size);
  const menu = contextMenuProps({ type: "widget", widgetId: instance.id });
  const dragging = dragAt !== undefined;

  return (
    <section
      role="group"
      aria-label={`${def.title} widget${moving ? ", moving" : ""}`}
      tabIndex={0}
      data-widget-id={instance.id}
      data-onboarding-target={onboardingTarget ? "onboarding-widgets" : undefined}
      onPointerDown={onPointerDown}
      onContextMenu={menu.onContextMenu}
      onKeyDown={menu.onKeyDown}
      style={{ left: dragAt?.left ?? col * WIDGET_CELL, top: dragAt?.top ?? row * WIDGET_CELL, width, height }}
      className={`pointer-events-auto absolute outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${widgetSurfaceClass} ${
        dragging ? "z-10 cursor-grabbing opacity-90 shadow-[0_18px_48px_rgba(0,0,0,0.35)]" : reduced ? "" : "transition-[left,top,width,height] duration-200 ease-out"
      } ${moving ? "ring-2 ring-(--accent)" : ""}`}
    >
      <Content size={size} />
    </section>
  );
}
