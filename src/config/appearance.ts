export const appearanceModes = ["light", "dark", "auto"] as const;
export type AppearanceMode = (typeof appearanceModes)[number];

export interface AccentColor {
  id: string;
  name: string;
  /** Used for selected rows, switches, focus rings. */
  value: string;
  /** Text colour that stays readable on `value`. */
  foreground: string;
}

export const accentColors = [
  { id: "blue", name: "Blue", value: "#0a60ff", foreground: "#ffffff" },
  { id: "purple", name: "Purple", value: "#9b4fc9", foreground: "#ffffff" },
  { id: "pink", name: "Pink", value: "#e8458f", foreground: "#ffffff" },
  { id: "red", name: "Red", value: "#d9363e", foreground: "#ffffff" },
  { id: "orange", name: "Orange", value: "#e8710a", foreground: "#ffffff" },
  { id: "yellow", name: "Yellow", value: "#f2b705", foreground: "#1c1c1e" },
  { id: "green", name: "Green", value: "#3d9a3a", foreground: "#ffffff" },
  { id: "graphite", name: "Graphite", value: "#6e6e73", foreground: "#ffffff" },
] as const satisfies readonly AccentColor[];

export type AccentColorId = (typeof accentColors)[number]["id"];

export const getAccent = (id: string): AccentColor =>
  accentColors.find((a) => a.id === id) ?? accentColors[0];

/** Dock icon size in px for the 0–100 slider (50 → 52px, the original size). */
export const dockIconSize = (value: number) => Math.round(36 + value * 0.32);

/** Largest magnification scale for the 0–100 strength slider (50 → ~1.58×). */
export const magnificationScale = (value: number) => 1.15 + value * 0.0085;
