import { siteConfig } from "@/config/site";
import type { SafariRoute } from "./safari-routes";

export type FavoriteTarget =
  | { type: "internal"; route: SafariRoute }
  | { type: "external"; url: string };

export interface SafariFavorite {
  id: string;
  label: string;
  icon: "about" | "projects" | "contact" | "github" | "linkedin";
  /** External favorites without a configured URL are omitted. */
  target: FavoriteTarget | null;
}

const external = (url: string): FavoriteTarget | null => (url ? { type: "external", url } : null);

const all: readonly SafariFavorite[] = [
  { id: "about", label: "About Me", icon: "about", target: { type: "internal", route: "about" } },
  { id: "projects", label: "Projects", icon: "projects", target: { type: "internal", route: "projects" } },
  { id: "github", label: "GitHub", icon: "github", target: external(siteConfig.profiles.github) },
  { id: "linkedin", label: "LinkedIn", icon: "linkedin", target: external(siteConfig.profiles.linkedin) },
  { id: "contact", label: "Contact", icon: "contact", target: { type: "internal", route: "contact" } },
];

/** Favorites that can actually be opened. */
export const safariFavorites = all.filter((f) => f.target !== null);
