export type ContextMenuTarget =
  | { type: "desktop" }
  /** The layout menu on a window's green button. */
  | { type: "window-layout"; windowId: string }
  /** A widget on the desktop. */
  | { type: "widget"; widgetId: string }
  /** `source` is where the item was clicked; it decides which actions make sense. */
  | { type: "file"; fileId: string; source: "desktop" | "finder" };

export type MenuEntry =
  | {
      kind: "item";
      id: string;
      label: string;
      /** Display only, e.g. "↩". */
      shortcut?: string;
      disabled?: boolean;
      /** Set for radio-style entries (Sort By). */
      checked?: boolean;
      /** Spoken label when the visible one is short, e.g. "Move window to left half". */
      ariaLabel?: string;
      /** Small layout picture shown before the label (window layout menu). */
      diagram?: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "fill";
      run: () => void;
    }
  | { kind: "separator"; id: string }
  | { kind: "submenu"; id: string; label: string; disabled?: boolean; items: MenuEntry[] };
