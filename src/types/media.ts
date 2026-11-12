import type { ProjectCategoryId } from "@/data/project-categories";

/**
 * One image in the shared media library. This is the single source of truth for
 * every screenshot/photo: projects, Photos, Finder and Project Viewer all read it.
 */
export interface PortfolioMedia {
  /** Stable identifier. */
  id: string;
  /** Path under /public. */
  src: string;
  /** Optional smaller file for grids; falls back to `src`. */
  thumbnailSrc?: string;
  title: string;
  description?: string;
  alt: string;
  /** Project this image belongs to (the project record is not duplicated). */
  projectId?: string;
  /** Extra categories for images with no project. Project images inherit the project's categories. */
  categoryIds?: readonly ProjectCategoryId[];
  /** Intrinsic pixel size; reserves space and preserves the aspect ratio. */
  width: number;
  height: number;
  /** ISO 8601. Leave unset when unknown. */
  capturedAt?: string;
  addedAt?: string;
  tags?: readonly string[];
}
