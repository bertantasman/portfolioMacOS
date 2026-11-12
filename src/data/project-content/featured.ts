/**
 * The featured projects, in the order they are shown everywhere (Projects widget, Finder's Featured folder,
 * the GitHub app's Featured filter). This is the one place to choose and order them. Use the same ids as
 * the project content: a curated id, or "github:<repository id>".
 *
 * If this list is empty, the older per-project `featured` flags (a curated project's `featured: true`, or an
 * entry in data/github-overrides.ts) still apply, in registry order.
 */
// CourtRise shows public iOS delivery, BuGunluk collaborative product development, and GeoAttend an independently
// built iOS, Android and backend system, and LineMaster independent game development. They complement each other.
export const featuredProjectIds: readonly string[] = ["courtrise", "bugunluk", "geoattend", "linemaster"];
