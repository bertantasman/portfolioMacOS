import type { PointerEvent } from "react";
import type { ResizeEdge } from "@/types/window";

interface HandleProps {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
}

const handles: { edge: ResizeEdge; className: string }[] = [
  { edge: "n", className: "inset-x-3 -top-[3px] h-1.5 cursor-ns-resize" },
  { edge: "s", className: "inset-x-3 -bottom-[3px] h-1.5 cursor-ns-resize" },
  { edge: "e", className: "inset-y-3 -right-[3px] w-1.5 cursor-ew-resize" },
  { edge: "w", className: "inset-y-3 -left-[3px] w-1.5 cursor-ew-resize" },
  { edge: "nw", className: "-top-1 -left-1 size-3.5 cursor-nwse-resize" },
  { edge: "ne", className: "-top-1 -right-1 size-3.5 cursor-nesw-resize" },
  { edge: "sw", className: "-bottom-1 -left-1 size-3.5 cursor-nesw-resize" },
  { edge: "se", className: "-right-1 -bottom-1 size-3.5 cursor-nwse-resize" },
];

/** Invisible pointer targets around the window edge. Pointer-only affordance. */
export function WindowResizeHandles({
  getHandleProps,
}: {
  getHandleProps: (edge: ResizeEdge) => HandleProps;
}) {
  return (
    <>
      {handles.map(({ edge, className }) => (
        <div
          key={edge}
          aria-hidden
          data-resize-edge={edge}
          {...getHandleProps(edge)}
          className={`absolute z-10 touch-none ${className}`}
        />
      ))}
    </>
  );
}
