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
    id: "readpoint",
    slug: "readpoint",
    title: "ReadPoint",
    shortDescription:
      "ReadPoint is a speed-reading iOS app published on the App Store. It shows text one word at a time at a fixed focus point and highlights the centre letter of every word in red.",
    categories: ["ios-development"],
  },
  {
    id: "chickenflip",
    slug: "chickenflip",
    title: "ChickenFlip",
    shortDescription:
      "An endless arcade game about a chicken on a skateboard: procedurally generated ramps, 360° flips, eggs for fuel and daily challenges. Built for iOS with SwiftUI and SpriteKit and ported to Android with Kotlin and libGDX.",
    categories: ["game-development", "ios-development", "android-development"],
  },
  {
    id: "courtrise-web",
    slug: "courtrise-web",
    title: "CourtRise Web",
    shortDescription:
      "The website for the CourtRise app: a Next.js site with a landing page, features, about, privacy, terms, support and account-deletion pages.",
    categories: ["web-development"],
  },
  {
    id: "bugunluk-web",
    slug: "bugunluk-web",
    title: "BuGunluk Web",
    shortDescription:
      "A web employer portal prototype for BuGunluk, built with Next.js and Firebase. It reuses the mobile app's Firestore data model for jobs, applications and messages.",
    categories: ["web-development"],
  },
  {
    id: "parsing-face-color",
    slug: "parsing-face-color",
    title: "ParsingFaceColor",
    shortDescription:
      "A Python experiment that splits a face photo into regions (skin, hair, eyebrows, eyes and lips) with a face-parsing model, then calculates each region's average colour and names it.",
    categories: ["artificial-intelligence"],
  },
  {
    id: "pos-tracking-system",
    slug: "pos-tracking-system",
    title: "POS Tracking System",
    shortDescription:
      "A dashboard and API for tracking customers, their POS devices, sales and billing, with an Express and Prisma backend and a single-page web frontend.",
    categories: ["web-development", "backend-development"],
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
