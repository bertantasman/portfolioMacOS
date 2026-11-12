/** Sections of System Settings that other parts of the desktop can open directly. */
export const settingsPageIds = ["appearance", "wallpaper", "dock", "accessibility", "notifications", "sound", "about"] as const;

export type SettingsPageId = (typeof settingsPageIds)[number];

export const isSettingsPageId = (value: unknown): value is SettingsPageId =>
  typeof value === "string" && (settingsPageIds as readonly string[]).includes(value);
