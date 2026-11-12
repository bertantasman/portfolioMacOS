export const siteConfig = {
  title: "Bertan Taşman’s macOS Portfolio",
  /** Release version shown in System Settings → About. Leave unset until one exists. */
  version: undefined as string | undefined,
  description:
    "An interactive, macOS-inspired desktop portfolio for a software developer.",
  owner: {
    name: "Bertan Taşman",
  },
  /**
   * Public profile URLs (absolute http(s) URLs). Leave empty until configured:
   * the Dock will not navigate anywhere for an empty entry.
   */
  profiles: {
    github: "https://github.com/bertantasman",
    linkedin: "https://www.linkedin.com/in/ahmet-bertan-ta%C5%9Fman-5339b4203/",
    instagram: "https://www.instagram.com/bertantasmann/",
  },
} as const;
