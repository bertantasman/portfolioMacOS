/** Actions a menu item can trigger. Only actions that exist are listed. */
export type MenuActionId = "open-about" | "lock-screen" | "take-tour";

export interface MenuActionItem {
  type: "item";
  id: string;
  label: string;
  /** Display-only shortcut hint, e.g. "⌘N". */
  shortcut?: string;
  disabled?: boolean;
  /** Renders a submenu chevron. Submenus themselves are not implemented yet. */
  hasSubmenu?: boolean;
  action?: MenuActionId;
}

export interface MenuSeparator {
  type: "separator";
  id: string;
}

export type MenuEntry = MenuActionItem | MenuSeparator;

export interface MenuDefinition {
  id: string;
  label: string;
  items: readonly MenuEntry[];
}
