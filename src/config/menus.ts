import type { MenuDefinition, MenuEntry } from "@/types/menu";

const sep = (id: string): MenuEntry => ({ type: "separator", id });

const item = (
  id: string,
  label: string,
  options: Partial<Omit<Extract<MenuEntry, { type: "item" }>, "type" | "id" | "label">> = {},
): MenuEntry => ({ type: "item", id, label, disabled: true, ...options });

export const appleMenu: MenuDefinition = {
  id: "apple",
  label: "Apple",
  items: [
    item("about", "About This Portfolio", { disabled: false, action: "open-about" }),
    sep("s1"),
    item("settings", "System Settings…"),
    sep("s2"),
    item("recent", "Recent Items", { hasSubmenu: true }),
    sep("s3"),
    item("tour", "Take a Tour", { disabled: false, action: "take-tour" }),
    item("lock", "Lock Screen", { disabled: false, action: "lock-screen" }),
    sep("s3b"),
    item("sleep", "Sleep"),
    item("restart", "Restart…"),
    item("shutdown", "Shut Down…"),
  ],
};

/** Menus shown after the Apple menu. The first one is the active application's menu. */
export const appMenus: readonly MenuDefinition[] = [
  {
    id: "finder",
    label: "Finder",
    items: [
      item("about-finder", "About Finder"),
      sep("s1"),
      item("preferences", "Preferences…", { shortcut: "⌘," }),
      sep("s2"),
      item("hide", "Hide Finder", { shortcut: "⌘H" }),
      item("hide-others", "Hide Others", { shortcut: "⌥⌘H" }),
      item("show-all", "Show All"),
    ],
  },
  {
    id: "file",
    label: "File",
    items: [
      item("new-window", "New Finder Window", { shortcut: "⌘N" }),
      item("new-folder", "New Folder", { shortcut: "⇧⌘N" }),
      item("open", "Open", { shortcut: "⌘O" }),
      sep("s1"),
      item("close-window", "Close Window", { shortcut: "⌘W" }),
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      item("undo", "Undo", { shortcut: "⌘Z" }),
      item("redo", "Redo", { shortcut: "⇧⌘Z" }),
      sep("s1"),
      item("cut", "Cut", { shortcut: "⌘X" }),
      item("copy", "Copy", { shortcut: "⌘C" }),
      item("paste", "Paste", { shortcut: "⌘V" }),
      item("select-all", "Select All", { shortcut: "⌘A" }),
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      item("as-icons", "as Icons", { shortcut: "⌘1" }),
      item("as-list", "as List", { shortcut: "⌘2" }),
      item("as-columns", "as Columns", { shortcut: "⌘3" }),
      sep("s1"),
      item("view-options", "Show View Options", { shortcut: "⌘J" }),
    ],
  },
  {
    id: "go",
    label: "Go",
    items: [
      item("back", "Back", { shortcut: "⌘[" }),
      item("forward", "Forward", { shortcut: "⌘]" }),
      sep("s1"),
      item("applications", "Applications", { shortcut: "⇧⌘A" }),
      item("documents", "Documents", { shortcut: "⇧⌘O" }),
      item("downloads", "Downloads", { shortcut: "⌥⌘L" }),
    ],
  },
  {
    id: "window",
    label: "Window",
    items: [
      item("minimize", "Minimize", { shortcut: "⌘M" }),
      item("zoom", "Zoom"),
      sep("s1"),
      item("bring-all", "Bring All to Front"),
    ],
  },
  {
    id: "help",
    label: "Help",
    items: [
      item("help", "Portfolio Help"),
      item("shortcuts", "Keyboard Shortcuts"),
      sep("s1"),
      item("about-site", "About This Website", { disabled: false, action: "open-about" }),
    ],
  },
];
