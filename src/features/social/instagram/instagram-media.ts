import { getAllMedia } from "@/data/media";
import type { PortfolioMedia } from "@/types/media";

/** The tag that approves an image of the shared media library for the Instagram app. */
export const INSTAGRAM_TAG = "instagram";

/**
 * Photos the owner has approved for Instagram: media tagged "instagram" in src/data/media.ts. Project
 * screenshots and other library images are not Instagram content and never appear here.
 */
export const getInstagramMedia = (media: readonly PortfolioMedia[] = getAllMedia()): readonly PortfolioMedia[] =>
  media.filter((m) => m.tags?.includes(INSTAGRAM_TAG));
