export interface Wallpaper {
  id: string;
  name: string;
  /** Full-resolution image, served from /public. */
  src: string;
  thumbnail?: string;
  /** Solid colour shown while the image loads; should match its dominant tone. */
  fallbackColor: string;
}

// Original wallpapers rendered by scripts/generate-wallpaper.mjs.
export const wallpapers = [
  { id: "aurora", name: "Aurora", src: "/wallpapers/aurora.webp", thumbnail: "/wallpapers/aurora-thumb.webp", fallbackColor: "#2a1a78" },
  { id: "dusk", name: "Dusk", src: "/wallpapers/dusk.webp", thumbnail: "/wallpapers/dusk-thumb.webp", fallbackColor: "#5a2050" },
  { id: "lagoon", name: "Lagoon", src: "/wallpapers/lagoon.webp", thumbnail: "/wallpapers/lagoon-thumb.webp", fallbackColor: "#0b4a5a" },
  { id: "graphite", name: "Graphite", src: "/wallpapers/graphite.webp", thumbnail: "/wallpapers/graphite-thumb.webp", fallbackColor: "#1c1d21" },
] as const satisfies readonly Wallpaper[];

export const defaultWallpaper: Wallpaper = wallpapers[0];

export const getWallpaper = (id: string): Wallpaper =>
  wallpapers.find((w) => w.id === id) ?? defaultWallpaper;
