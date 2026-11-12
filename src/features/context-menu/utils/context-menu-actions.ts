import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { cleanUpDesktop, sortDesktop } from "@/features/desktop-icons/lib/arrange";
import { getDesktopItems, getSortAvailability } from "@/features/desktop-icons/lib/layout";
import { copyText } from "@/lib/clipboard";
import {
  getOpenHandlers,
  openApplicationById,
  openInfoById,
  openSystemSettings,
  openVirtualFile,
} from "@/lib/navigation";
import { getVirtualPath } from "@/lib/virtual-fs/path";
import { canWindowFitSnapPosition } from "@/lib/window-snapping";
import { useContextMenuStore } from "@/store/context-menu-store";
import { getWidgetDefinition } from "@/features/widgets/registry/widget-registry";
import { useWidgetStore } from "@/store/widget-store";
import { useWindowStore } from "@/store/window-store";
import type { WidgetSize } from "@/features/widgets/types/widgets";
import type { SnapTarget } from "@/types/window";
import { useDesktopStore, type DesktopSortKey } from "@/store/desktop-store";
import { useOverlayStore } from "@/store/overlay-store";
import type { ContextMenuTarget, MenuEntry } from "../types/context-menu";

export async function copyWithFeedback(text: string, what: string) {
  const { showToast } = useContextMenuStore.getState();
  // Only report success when the browser says the copy happened.
  if (await copyText(text)) showToast(`${what} copied`);
  else showToast(`Couldn’t copy ${what.toLowerCase()}. Your browser blocked clipboard access.`, "error");
}

const separator = (id: string): MenuEntry => ({ kind: "separator", id });

const sortLabels: Record<DesktopSortKey, string> = { name: "Name", kind: "Kind", modified: "Date Modified", size: "Size" };

function desktopEntries(): MenuEntry[] {
  const { sortBy } = useDesktopStore.getState();
  const available = getSortAvailability(getDesktopItems(sortBy));
  return [
    { kind: "item", id: "open-finder", label: "Open Finder", run: () => openApplicationById("finder") },
    separator("s1"),
    {
      kind: "submenu",
      id: "sort-by",
      label: "Sort By",
      items: (Object.keys(sortLabels) as DesktopSortKey[]).map(
        (key): MenuEntry => ({
          kind: "item",
          id: `sort-${key}`,
          label: sortLabels[key],
          checked: sortBy === key,
          // Only offered when the items actually carry that metadata.
          disabled: !available[key],
          run: () => sortDesktop(key),
        }),
      ),
    },
    { kind: "item", id: "clean-up", label: "Clean Up", run: cleanUpDesktop },
    separator("s2"),
    { kind: "item", id: "edit-widgets", label: "Edit Widgets…", run: () => useOverlayStore.getState().open("widget-gallery") },
    { kind: "item", id: "change-wallpaper", label: "Change Wallpaper…", run: () => openSystemSettings("wallpaper") },
    { kind: "item", id: "view-options", label: "Show View Options", run: () => useOverlayStore.getState().open("view-options") },
  ];
}

function fileEntries(fileId: string): MenuEntry[] {
  const file = fs.getFile(fileId);
  if (!file) return [{ kind: "item", id: "missing", label: "This item is no longer available", disabled: true, run: () => {} }];

  const handlers = getOpenHandlers(file);
  const entries: MenuEntry[] = [
    { kind: "item", id: "open", label: "Open", shortcut: "↩", disabled: handlers.length === 0, run: () => openVirtualFile(file.id) },
  ];
  // "Open With" only appears when the registry lists more than one application for this kind.
  if (handlers.length > 1) {
    entries.push({
      kind: "submenu",
      id: "open-with",
      label: "Open With",
      items: handlers.map((app): MenuEntry => ({ kind: "item", id: `open-with-${app.id}`, label: app.name, run: () => openApplicationById(app.id) })),
    });
  }
  entries.push(
    separator("s1"),
    { kind: "item", id: "get-info", label: "Get Info", run: () => openInfoById(file.id) },
    separator("s2"),
    { kind: "item", id: "copy-name", label: "Copy Name", run: () => void copyWithFeedback(file.name, "Name") },
    { kind: "item", id: "copy-path", label: "Copy Path", run: () => void copyWithFeedback(getVirtualPath(fs, file.id), "Path") },
  );
  return entries;
}

const layoutOptions: { target: SnapTarget; label: string; aria: string }[] = [
  { target: "fill", label: "Fill", aria: "Fill available desktop area" },
  { target: "left", label: "Left Half", aria: "Move window to left half" },
  { target: "right", label: "Right Half", aria: "Move window to right half" },
  { target: "top-left", label: "Top Left", aria: "Move window to top-left quarter" },
  { target: "top-right", label: "Top Right", aria: "Move window to top-right quarter" },
  { target: "bottom-left", label: "Bottom Left", aria: "Move window to bottom-left quarter" },
  { target: "bottom-right", label: "Bottom Right", aria: "Move window to bottom-right quarter" },
];

/** Hands keyboard focus back to the window after a layout change, so it keeps working from the keyboard. */
function focusWindowElement(windowId: string) {
  setTimeout(() => document.querySelector<HTMLElement>(`[data-window-id="${CSS.escape(windowId)}"]`)?.focus({ preventScroll: true }), 60);
}

function windowLayoutEntries(windowId: string): MenuEntry[] {
  const { windows, workspace, dockClearance, snapWindow, restoreWindow } = useWindowStore.getState();
  const win = windows.find((w) => w.id === windowId);
  if (!win || !win.resizable) return [{ kind: "item", id: "unavailable", label: "No layouts for this window", disabled: true, run: () => {} }];

  // Only layouts that fit this window's minimum size in the current workspace are offered.
  const entries: MenuEntry[] = layoutOptions
    .filter((o) => canWindowFitSnapPosition(win, o.target, workspace, dockClearance))
    .map((o): MenuEntry => ({
      kind: "item",
      id: `layout-${o.target}`,
      label: o.label,
      ariaLabel: o.aria,
      diagram: o.target,
      checked: o.target === "fill" ? win.isMaximized : win.snap === o.target,
      run: () => {
        snapWindow(windowId, o.target);
        focusWindowElement(windowId);
      },
    }));
  if (win.isMaximized || win.snap) {
    entries.push(separator("restore-sep"), {
      kind: "item",
      id: "layout-restore",
      label: "Restore",
      ariaLabel: "Restore previous window size",
      run: () => {
        restoreWindow(windowId);
        focusWindowElement(windowId);
      },
    });
  }
  return entries.length > 0 ? entries : [{ kind: "item", id: "none", label: "No layouts fit this screen", disabled: true, run: () => {} }];
}

const widgetSizeLabels: Record<WidgetSize, string> = { small: "Small", medium: "Medium", large: "Large" };

function widgetEntries(widgetId: string): MenuEntry[] {
  const store = useWidgetStore.getState();
  const widget = store.widgets.find((w) => w.id === widgetId);
  const def = widget && getWidgetDefinition(widget.type);
  if (!widget || !def) return [{ kind: "item", id: "gone", label: "This widget is no longer available", disabled: true, run: () => {} }];
  // Only sizes the widget supports and that currently have room are offered.
  const sizes = def.supportedSizes.filter((s) => s === widget.size || store.canResize(widgetId, s));
  return [
    ...sizes.map(
      (s): MenuEntry => ({
        kind: "item",
        id: `size-${s}`,
        label: widgetSizeLabels[s],
        ariaLabel: `Resize widget to ${s}`,
        checked: widget.size === s,
        run: () => void useWidgetStore.getState().resizeWidget(widgetId, s),
      }),
    ),
    separator("w1"),
    {
      kind: "item",
      id: "move-widget",
      label: "Move Widget",
      ariaLabel: "Move widget with the arrow keys",
      run: () => {
        useWidgetStore.getState().startMove(widgetId);
        setTimeout(() => document.querySelector<HTMLElement>(`[data-widget-id="${CSS.escape(widgetId)}"]`)?.focus({ preventScroll: true }), 60);
      },
    },
    { kind: "item", id: "edit-widgets", label: "Edit Widgets…", run: () => useOverlayStore.getState().open("widget-gallery") },
    separator("w2"),
    { kind: "item", id: "remove-widget", label: "Remove Widget", ariaLabel: `Remove ${def.title} widget`, run: () => useWidgetStore.getState().removeWidget(widgetId) },
  ];
}

/** The entries for a target. Built when the menu renders, so they always reflect current state. */
export function buildMenuEntries(target: ContextMenuTarget): MenuEntry[] {
  if (target.type === "desktop") return desktopEntries();
  if (target.type === "window-layout") return windowLayoutEntries(target.windowId);
  if (target.type === "widget") return widgetEntries(target.widgetId);
  return fileEntries(target.fileId);
}
