import type { SidebarSection } from "../types/finder";
import { FOLDER, ROOT_ID } from "@/data/portfolio-file-system";

// Entries without a folderId are not implemented yet and render disabled.
export const sidebarSections: readonly SidebarSection[] = [
  {
    id: "favorites",
    title: "Favorites",
    entries: [
      { id: "airdrop", label: "AirDrop", icon: "airdrop" },
      { id: "recents", label: "Recents", icon: "recents" },
      { id: "applications", label: "Applications", icon: "applications", folderId: FOLDER.applications },
      { id: "desktop", label: "Desktop", icon: "desktop", folderId: FOLDER.desktop },
      { id: "documents", label: "Documents", icon: "documents", folderId: FOLDER.documents },
      { id: "downloads", label: "Downloads", icon: "downloads", folderId: FOLDER.downloads },
    ],
  },
  {
    id: "locations",
    title: "Locations",
    entries: [
      { id: "macbook", label: "", icon: "computer", folderId: ROOT_ID },
      { id: "macintosh-hd", label: "Macintosh HD", icon: "disk" },
    ],
  },
  {
    id: "tags",
    title: "Tags",
    entries: [
      { id: "tag-red", label: "Red", color: "#ff453a" },
      { id: "tag-orange", label: "Orange", color: "#ff9f0a" },
      { id: "tag-yellow", label: "Yellow", color: "#ffd60a" },
      { id: "tag-green", label: "Green", color: "#32d74b" },
      { id: "tag-blue", label: "Blue", color: "#0a84ff" },
      { id: "tag-purple", label: "Purple", color: "#bf5af2" },
    ],
  },
];
