import { projectCategories } from "@/data/project-categories";
import {
  getAllMedia,
  getMediaByCategory,
  getMediaByProjectId,
  getRecentMedia,
} from "@/data/media";
import { getRegistry } from "@/lib/projects/registry";
import type { PortfolioMedia } from "@/types/media";

export type AlbumSection = "library" | "albums" | "projects";

export interface Album {
  /** "all" | "recents" | "all-projects" | "category:<id>" | "project:<id>" */
  id: string;
  title: string;
  section: AlbumSection;
  /** Shown in the toolbar when the album has nothing in it. */
  emptyMessage: string;
}

export const ALL_PHOTOS_ID = "all";

/** Albums are generated from the project registry and media library; nothing is listed by hand. */
export function getAlbums(): Album[] {
  return [
    { id: ALL_PHOTOS_ID, title: "All Photos", section: "library", emptyMessage: "No images have been added to the library." },
    { id: "recents", title: "Recents", section: "library", emptyMessage: "Images with a capture or added date appear here." },
    { id: "all-projects", title: "All Projects", section: "albums", emptyMessage: "No project images have been added yet." },
    ...projectCategories.map(
      (c): Album => ({
        id: `category:${c.id}`,
        title: c.name,
        section: "albums",
        emptyMessage: "No images have been added to this album.",
      }),
    ),
    // Project albums exist only when the project actually has images.
    ...getRegistry()
      .all.filter((p) => getMediaByProjectId(p.id).length > 0)
      .map(
        (p): Album => ({
          id: `project:${p.id}`,
          title: p.title,
          section: "projects",
          emptyMessage: "No images have been added to this album.",
        }),
      ),
  ];
}

/** Images in an album. Unknown albums are simply empty. */
export function getAlbumMedia(albumId: string): readonly PortfolioMedia[] {
  if (albumId === ALL_PHOTOS_ID) return getAllMedia();
  if (albumId === "recents") return getRecentMedia();
  if (albumId === "all-projects") return getAllMedia().filter((m) => m.projectId);
  if (albumId.startsWith("category:")) return getMediaByCategory(albumId.slice("category:".length));
  if (albumId.startsWith("project:")) return getMediaByProjectId(albumId.slice("project:".length));
  return [];
}
