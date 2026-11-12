import { getProfileLink, type SocialPlatform } from "@/features/social/utils/social-links";

/** The apps of the mobile shell. They only describe presentation; every piece of content comes from the shared data. */
export const MOBILE_APP_IDS = ["projects", "about", "resume", "contact", "safari", "files", "notes", "photos", "settings"] as const;
export type MobileAppId = (typeof MOBILE_APP_IDS)[number];

export type AppCategory = "Portfolio" | "Work" | "Tools" | "Social";

export interface MobileApp {
  id: MobileAppId;
  name: string;
  icon: string;
  category: AppCategory;
  keywords: readonly string[];
}

const icon = (id: string) => `/icons/apps/${id}.svg`;

export const mobileApps: readonly MobileApp[] = [
  { id: "projects", name: "Projects", icon: icon("projects"), category: "Work", keywords: ["work", "apps", "case study", "portfolio"] },
  { id: "about", name: "About", icon: icon("about-me"), category: "Portfolio", keywords: ["about me", "bio", "experience", "education", "skills"] },
  { id: "resume", name: "Resume", icon: icon("preview"), category: "Portfolio", keywords: ["cv", "curriculum vitae", "pdf"] },
  { id: "contact", name: "Contact", icon: icon("contact"), category: "Portfolio", keywords: ["email", "mail", "hire", "message"] },
  { id: "safari", name: "Safari", icon: icon("safari"), category: "Portfolio", keywords: ["browser", "links", "web"] },
  { id: "files", name: "Files", icon: icon("finder"), category: "Tools", keywords: ["finder", "folders", "documents"] },
  { id: "notes", name: "Notes", icon: icon("notes"), category: "Portfolio", keywords: ["story", "reading"] },
  { id: "photos", name: "Photos", icon: icon("photos"), category: "Work", keywords: ["screenshots", "gallery", "images"] },
  { id: "settings", name: "Settings", icon: icon("system-settings"), category: "Tools", keywords: ["appearance", "theme", "preferences"] },
];

export const isMobileAppId = (id: string): id is MobileAppId => (MOBILE_APP_IDS as readonly string[]).includes(id);
export const getMobileApp = (id: string): MobileApp | undefined => mobileApps.find((a) => a.id === id);

/** Pinned to the Dock: the four things a recruiter looks for first. */
export const DOCK_APPS: readonly MobileAppId[] = ["projects", "safari", "resume", "contact"];
/** First home-screen page, in order (the Dock apps are not repeated). */
export const HOME_APPS: readonly MobileAppId[] = ["about", "files", "photos", "notes", "settings"];

export interface ExternalApp {
  id: SocialPlatform;
  name: string;
  icon: string;
  category: "Social";
  /** Verified profile URL; the app is left out when none is configured. */
  url: string;
}

const externalDefs: readonly { id: SocialPlatform; name: string }[] = [
  { id: "github", name: "GitHub" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
];

/** Social apps open the real profile in a new tab; only platforms with a valid configured link are offered. */
export function getExternalApps(): ExternalApp[] {
  return externalDefs.flatMap((d) => {
    const link = getProfileLink(d.id);
    return link ? [{ id: d.id, name: d.name, icon: icon(d.id), category: "Social" as const, url: link.url }] : [];
  });
}
