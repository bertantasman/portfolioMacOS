import type { PortfolioProject } from "@/types/project";

// Only facts supplied by the portfolio owner belong here. Leave a field unset
// until it is known; mark best guesses in `provisional`.
export const projects: readonly PortfolioProject[] = [
  {
    id: "bugunluk",
    slug: "bugunluk",
    title: "BuGunluk",
    shortDescription:
      "BuGunluk is a native iOS platform connecting students and young workers with flexible, short-term job opportunities. Built collaboratively with a small team, the application combines role-based experiences, job discovery, applications, employer management, and Firebase-powered workflows.",
    // A native iOS application (source reviewed 2026-10-27). The repository is private and no link is published.
    categories: ["ios-development"],
  },
  {
    id: "courtrise",
    slug: "courtrise",
    title: "CourtRise",
    shortDescription:
      "CourtRise is a published native iOS basketball training application featuring adaptive drills, XP progression, player attributes, training statistics, and an optional Pro subscription.",
    // A native iOS app with a public App Store listing (checked 2026-10-27). The source repository is private and has no link here.
    categories: ["ios-development"],
  },
  {
    id: "geoattend",
    slug: "geoattend",
    // "GeoAttend" is a portfolio pseudonym, not a registered product name. The organization it serves is deliberately
    // not named anywhere in this portfolio (see docs/GEOATTEND_CASE_STUDY.md).
    title: "GeoAttend",
    shortDescription:
      "An independently developed native iOS and Android system for event management, organization workflows, secure attendance verification, and administrative reporting.",
    categories: ["institutional-mobile", "ios-development", "android-development"],
    features: [
      "iOS support",
      "Android support",
      "Location-based attendance verification",
      "Member management",
      "Organizational roles",
    ],
  },
  {
    id: "linemaster",
    slug: "linemaster",
    title: "LineMaster",
    shortDescription:
      "An independently developed mobile arcade game featuring physics-based swinging, procedural environments, adaptive gameplay mechanics, daily challenges, and progression systems.",
    // The source repository is private (checked 2026-10-27), so no GitHub link is published and the public GitHub
    // listing does not include it. See docs/LINEMASTER_CASE_STUDY.md.
    categories: ["game-development", "ios-development", "android-development"],
  },
  {
    id: "macos-portfolio",
    slug: "macos-portfolio",
    title: "macOS Portfolio",
    shortDescription: "The interactive macOS-inspired portfolio currently being developed.",
    categories: ["web-development"],
    status: "in-development",
  },
];

const byId = new Map(projects.map((p) => [p.id, p]));

export const getProjectById = (id: string): PortfolioProject | undefined => byId.get(id);
