import type { ProjectCategoryId } from "@/data/project-categories";
import type { GitHubRepository } from "@/lib/github/types";

import type { ProjectContent, ProjectStatus } from "@/types/project-content";

export type { ProjectStatus };

/** A project screenshot as the gallery shows it, resolved from the media library. */
export interface ProjectScreenshot {
  /** Path under /public. */
  src: string;
  /** Intrinsic size in pixels; reserves the right space and keeps portrait/landscape ratios. */
  width: number;
  height: number;
  alt?: string;
  caption?: string;
  /** The media record this screenshot comes from. */
  mediaId: string;
}

export interface PortfolioProject {
  /** Stable identifier referenced by the virtual file system. */
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  /** A project may belong to several categories; it is stored once. */
  categories: readonly ProjectCategoryId[];
  /** Fields whose value is a best guess and still needs the owner's confirmation. */
  provisional?: readonly (keyof PortfolioProject)[];
  /** Stated characteristics, not implementation details. */
  features?: readonly string[];
  technologies?: readonly string[];
  thumbnail?: string;
  githubUrl?: string;
  liveUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  documentationUrl?: string;
  /** ISO 8601 dates. */
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  featured?: boolean;
  /** One line under the title; from curated content. */
  tagline?: string;
  /** Explicit position among the featured projects (0 = first). */
  featuredOrder?: number;
  /** The curated content for this project, if any. */
  content?: ProjectContent;
  /** Where the project comes from: written by hand, or backed only by a GitHub repository. */
  source?: "curated" | "github";
  /** The repository this project is (or is linked to), when it has one. Real GitHub data, never invented. */
  repository?: GitHubRepository;
  /** For a curated project: the repository it corresponds to ("owner/name"), so it is not listed twice. */
  githubRepository?: string;
  /**
   * The same link by GitHub's numeric repository id. Prefer this: it survives a repository rename, while
   * "owner/name" does not. Takes precedence over `githubRepository`.
   */
  githubRepositoryId?: number;
}
