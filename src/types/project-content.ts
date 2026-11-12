/**
 * Curated portfolio content for one project: the professional narrative that GitHub can't provide.
 * Every field is optional and nothing is ever filled in automatically: a field that isn't written here
 * simply doesn't appear. GitHub supplies the facts (name, language, topics, dates, README); this supplies the story.
 */
export const PROJECT_STATUSES = ["planning", "in-development", "prototype", "published", "completed", "maintained", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TECHNOLOGY_CATEGORIES = ["frontend", "backend", "mobile", "database", "infrastructure", "tools"] as const;
export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

export interface ProjectTechnology {
  name: string;
  /** Only set when you know the role; technologies without one are shown ungrouped. */
  category?: TechnologyCategory;
}

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
  /** A Lucide icon name from the allow-list in the feature card (e.g. "map-pin"). Optional. */
  icon?: string;
  /** A screenshot from the shared media library. */
  mediaId?: string;
}

export interface ProjectChallenge {
  title: string;
  challenge: string;
  approach?: string;
  result?: string;
}

export interface ProjectOutcome {
  /** e.g. "Published application", "University project", "Open-source release". */
  label: string;
  description?: string;
  /** A link that backs the claim up (store page, release, certificate…). */
  evidenceUrl?: string;
}

/** A titled block of verified technical information: architecture, data storage, deployment, testing… */
export interface ProjectTechnicalDetail {
  title: string;
  body: string;
}

export interface ProjectLinks {
  github?: string;
  liveDemo?: string;
  appStore?: string;
  googlePlay?: string;
  documentation?: string;
  videoDemo?: string;
}

/** A short, first-person story about why a project matters to the developer. Only for projects with verified personal context. */
export interface ProjectPersonalStory {
  title: string;
  paragraphs: readonly string[];
  /** Which paragraphs (by position) are shown as a preview elsewhere, so the full text lives in one place only. */
  previewParagraphs?: readonly number[];
}

/** A titled group of short statements, optionally with an intro line and a note about how far the claim is verified. */
export interface CaseStudyGroup {
  title: string;
  intro?: string;
  items: readonly string[];
}

/** One engineering decision. `verification` says plainly how far the claim was checked against the source. */
export interface CaseStudyHighlight {
  title: string;
  body: string;
  verification?: string;
}

/** A generic titled section: text, labelled items (optionally with a colour swatch), bullets, badges and a caveat. */
export interface CaseStudySection {
  id: string;
  title: string;
  /** Shorter name for the section navigation. */
  label?: string;
  paragraphs?: readonly string[];
  items?: readonly { label: string; value?: string; /** A hex colour such as "#FF6B00", shown as a small chip. */ swatch?: string }[];
  /** Introduces `bullets` when both text and a list are shown. */
  bulletsIntro?: string;
  bullets?: readonly string[];
  badges?: readonly string[];
  /** A short caveat shown muted: what the section does not claim. */
  note?: string;
}

/**
 * Optional case-study sections for projects with a written product story. Every part is optional and
 * nothing is generated: a part that isn't written here doesn't appear.
 */
export interface ProjectCaseStudy {
  /** Further sections, shown in the order given after the technologies. */
  sections?: readonly CaseStudySection[];
  /** Key facts shown at the top of the case study: role, team, platform, technologies, status, start. */
  summary?: readonly { label: string; value: string }[];
  /** How the project began, in the developer's own words. Shown verbatim. */
  origin?: ProjectPersonalStory;
  /** The developer's responsibilities: their own words plus what they owned, by area. */
  role?: { title: string; paragraphs: readonly string[]; ownership?: { title: string; items: readonly { label: string; value: string }[] } };
  /** How the team came together, as short labelled stages. */
  collaboration?: { title: string; stages: readonly { label: string; value: string }[] };
  /** The hardest part of the project, and what the developer took from it. Shown verbatim. */
  challenge?: ProjectPersonalStory;
  reflection?: ProjectPersonalStory;
  /** Who the product helps, one group per audience (for example workers and employers). */
  audiences?: readonly CaseStudyGroup[];
  userExperience?: { title: string; paragraphs: readonly string[]; designElements?: CaseStudyGroup };
  journeys?: readonly CaseStudyGroup[];
  architecture?: { intro: readonly string[]; facts: readonly { label: string; value: string }[] };
  highlights?: readonly CaseStudyHighlight[];
  currentStatus?: { badges: readonly string[]; paragraphs: readonly string[]; next?: CaseStudyGroup };
}

export interface ProjectContent {
  /** The project id this content belongs to: a curated id, or `github:<repository id>` (stable across renames). */
  projectId: string;
  displayName?: string;
  /** One line under the title. It is also what other apps (Finder, Spotlight, widgets) show as the summary. */
  tagline?: string;
  /** Paragraphs separated by a blank line. */
  overview?: string;
  problem?: string;
  solution?: string;
  features?: readonly ProjectFeature[];
  technologies?: readonly ProjectTechnology[];
  /** What you personally did. Leave it out for collaborative work you can't fully claim. */
  responsibilities?: readonly string[];
  challenges?: readonly ProjectChallenge[];
  outcomes?: readonly ProjectOutcome[];
  technicalDetails?: readonly ProjectTechnicalDetail[];
  /** The cover image, from the shared media library. Without one, the first project screenshot is used. */
  coverMediaId?: string;
  links?: ProjectLinks;
  developmentStatus?: ProjectStatus;
  /** Optional personal context ("A Project Close to Me"). It complements the factual description and never replaces it. */
  personalStory?: ProjectPersonalStory;
  caseStudy?: ProjectCaseStudy;
}
