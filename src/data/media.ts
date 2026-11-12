import type { PortfolioMedia } from "@/types/media";
import { projectCategories, type ProjectCategoryId } from "./project-categories";
import { getProjectById } from "@/lib/projects/registry";

// The shared media library. Add an image here (and its file under /public) and
// it appears in Photos, in its project's gallery, and in Finder's Pictures folder.
// Only list real assets; leave optional metadata unset when unknown.
// CourtRise: the English App Store screenshots and the app's own mascot images, from the developer's project (2026-11-12).
export const media: readonly PortfolioMedia[] = [
  {
    id: "courtrise-01",
    src: "/images/courtrise/courtrise-01-train-smarter.jpg",
    title: "Train smarter, level faster",
    description: "The dashboard: a start-training button, today's summary, daily challenges and recommended improvement.",
    alt: "CourtRise home dashboard with a Start Training button, daily summary and daily challenges",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-02",
    src: "/images/courtrise/courtrise-02-adaptive-drills.jpg",
    title: "Every session fits your level",
    description: "Drill targets and difficulty scale with the player's level, from Beginner to Elite.",
    alt: "CourtRise drill list showing training categories and a difficulty tier",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-03",
    src: "/images/courtrise/courtrise-03-drill-guide.jpg",
    title: "Know exactly how to improve",
    description: "A drill screen explaining how to do the drill, with tips, common mistakes and a target.",
    alt: "CourtRise drill detail screen with how-to steps, tips and a repetition target",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-04",
    src: "/images/courtrise/courtrise-04-live-workout.jpg",
    title: "Start the timer, own the reps",
    description: "A focused workout session with a timer and target.",
    alt: "CourtRise live workout screen with a running timer",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-05",
    src: "/images/courtrise/courtrise-05-daily-missions.jpg",
    title: "Build a habit one drill at a time",
    description: "Daily missions with XP rewards and streak tracking.",
    alt: "CourtRise dashboard with daily challenges, XP rewards and streaks",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-06",
    src: "/images/courtrise/courtrise-06-player-profile.jpg",
    title: "See your player profile grow",
    description: "The player card: level, overall rating and the five attributes.",
    alt: "CourtRise player card showing level, overall rating and five attributes",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-07",
    src: "/images/courtrise/courtrise-07-statistics.jpg",
    title: "Turn workouts into insights",
    description: "Shooting trends and training totals from session history.",
    alt: "CourtRise statistics screen with a shooting trend chart",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-08",
    src: "/images/courtrise/courtrise-08-pro.jpg",
    title: "Unlock deeper performance",
    description: "The optional Pro subscription: full training library, smart recommendations and performance insights.",
    alt: "CourtRise Pro screen listing full library, recommendations and insights",
    projectId: "courtrise",
    width: 660,
    height: 1434,
    tags: ["app store screenshot"],
  },
  {
    id: "courtrise-mascot-normal",
    src: "/images/courtrise/courtrise-mascot-normal.png",
    title: "Mascot: normal",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its normal state",
    projectId: "courtrise",
    width: 400,
    height: 560,
    tags: ["mascot"],
  },
  {
    id: "courtrise-mascot-happy",
    src: "/images/courtrise/courtrise-mascot-happy.png",
    title: "Mascot: happy",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its happy state",
    projectId: "courtrise",
    width: 373,
    height: 560,
    tags: ["mascot"],
  },
  {
    id: "courtrise-mascot-sad",
    src: "/images/courtrise/courtrise-mascot-sad.png",
    title: "Mascot: sad",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its sad state",
    projectId: "courtrise",
    width: 462,
    height: 560,
    tags: ["mascot"],
  },
  {
    id: "courtrise-mascot-angry",
    src: "/images/courtrise/courtrise-mascot-angry.png",
    title: "Mascot: angry",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its angry state",
    projectId: "courtrise",
    width: 373,
    height: 560,
    tags: ["mascot"],
  },
  {
    id: "courtrise-mascot-tired",
    src: "/images/courtrise/courtrise-mascot-tired.png",
    title: "Mascot: tired",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its tired state",
    projectId: "courtrise",
    width: 373,
    height: 560,
    tags: ["mascot"],
  },
  {
    id: "courtrise-mascot-idea",
    src: "/images/courtrise/courtrise-mascot-idea.png",
    title: "Mascot: idea",
    description: "One of the six mascot states the app uses for feedback and hints.",
    alt: "The CourtRise basketball mascot in its idea state",
    projectId: "courtrise",
    width: 373,
    height: 560,
    tags: ["mascot"],
  },
  // LineMaster: English gameplay screenshots (iPhone and iPad) from the developer's own device and simulator, 2026-11-12.
  {
    id: "linemaster-01",
    src: "/images/linemaster/linemaster-01-combo-trail.jpg",
    title: "Combo and release trail",
    description: "A combo multiplier on screen while the ball flies away from an anchor, leaving a trail.",
    alt: "iPhone gameplay with a combo multiplier and the ball's red trail over a night city",
    projectId: "linemaster",
    width: 660,
    height: 1428,
    tags: ["screenshot", "iphone"],
  },
  {
    id: "linemaster-02",
    src: "/images/linemaster/linemaster-02-night-city.jpg",
    title: "Swinging over the night city",
    description: "Gameplay on iPhone: the ball, glowing anchors and the city skyline at night, with the distance and best score at the top.",
    alt: "iPhone gameplay at night with glowing anchors and a city skyline",
    projectId: "linemaster",
    width: 660,
    height: 1428,
    tags: ["screenshot", "iphone"],
  },
  {
    id: "linemaster-03",
    src: "/images/linemaster/linemaster-03-boost-glow.jpg",
    title: "Boost anchors and the orange glow",
    description: "Orange boost anchors and an orange edge glow over the daytime sky.",
    alt: "iPhone gameplay in daylight with orange boost anchors and an orange glow around the screen",
    projectId: "linemaster",
    width: 660,
    height: 1428,
    tags: ["screenshot", "iphone"],
  },
  {
    id: "linemaster-04",
    src: "/images/linemaster/linemaster-04-home.jpg",
    title: "Home screen",
    description: "The start screen: best distance, the selected character, diamonds, and the Start, Customize, Daily and Power buttons.",
    alt: "LineMaster home screen with the selected character and Start, Customize, Daily and Power buttons",
    projectId: "linemaster",
    width: 660,
    height: 1428,
    tags: ["screenshot", "iphone"],
  },
  {
    id: "linemaster-05",
    src: "/images/linemaster/linemaster-05-daily-challenges.jpg",
    title: "Daily challenges",
    description: "Three daily challenges of Easy, Medium and Hard difficulty with progress bars and diamond rewards.",
    alt: "Daily challenges panel listing an easy, a medium and a hard challenge",
    projectId: "linemaster",
    width: 660,
    height: 1428,
    tags: ["screenshot", "iphone"],
  },
  {
    id: "linemaster-06",
    src: "/images/linemaster/linemaster-06-ipad-night.jpg",
    title: "iPad: night",
    description: "The same game on an iPad screen, at night.",
    alt: "iPad gameplay at night with glowing anchors and a city skyline",
    projectId: "linemaster",
    width: 973,
    height: 1400,
    tags: ["screenshot", "ipad"],
  },
  {
    id: "linemaster-07",
    src: "/images/linemaster/linemaster-07-ipad-sunset.jpg",
    title: "iPad: sunset",
    description: "The sunset stage of the day and night cycle on an iPad screen.",
    alt: "iPad gameplay with an orange sunset sky and a sun",
    projectId: "linemaster",
    width: 973,
    height: 1400,
    tags: ["screenshot", "ipad"],
  },
  {
    id: "linemaster-08",
    src: "/images/linemaster/linemaster-08-ipad-combo-trail.jpg",
    title: "iPad: combo and trail",
    description: "A combo multiplier and the release trail on an iPad screen.",
    alt: "iPad gameplay with a combo multiplier and the ball's trail",
    projectId: "linemaster",
    width: 973,
    height: 1400,
    tags: ["screenshot", "ipad"],
  },
  {
    id: "linemaster-09",
    src: "/images/linemaster/linemaster-09-ipad-boost-glow.jpg",
    title: "iPad: boost glow",
    description: "Boost anchors and the orange glow over a differently themed city on an iPad screen.",
    alt: "iPad gameplay with orange boost anchors, an orange glow and purple-toned buildings",
    projectId: "linemaster",
    width: 973,
    height: 1400,
    tags: ["screenshot", "ipad"],
  },
  {
    id: "linemaster-10",
    src: "/images/linemaster/linemaster-10-ipad-daily-challenges.jpg",
    title: "iPad: daily challenges",
    description: "The daily challenges panel on an iPad screen.",
    alt: "Daily challenges panel on an iPad screen",
    projectId: "linemaster",
    width: 973,
    height: 1400,
    tags: ["screenshot", "ipad"],
  },
];

function validate(items: readonly PortfolioMedia[]) {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const m of items) {
    if (seen.has(m.id)) errors.push(`Duplicate media id "${m.id}".`);
    seen.add(m.id);
    if (!m.src.startsWith("/")) errors.push(`Media "${m.id}" src must be a /public path.`);
    if (!(m.width > 0 && m.height > 0)) errors.push(`Media "${m.id}" needs positive width and height.`);
    // GitHub-backed projects arrive after the page loads, so their ids can only be checked once they exist.
    if (m.projectId && !m.projectId.startsWith("github:") && !getProjectById(m.projectId)) {
      errors.push(`Media "${m.id}" references unknown project "${m.projectId}".`);
    }
    for (const c of m.categoryIds ?? []) {
      if (!projectCategories.some((pc) => pc.id === c)) {
        errors.push(`Media "${m.id}" references unknown category "${c}".`);
      }
    }
  }
  if (errors.length > 0) throw new Error(`Invalid media library:\n - ${errors.join("\n - ")}`);
}

if (process.env.NODE_ENV !== "production") validate(media);

const byId = new Map(media.map((m) => [m.id, m]));

export const getAllMedia = (): readonly PortfolioMedia[] => media;
export const getMediaById = (id: string): PortfolioMedia | undefined => byId.get(id);
export const getMediaByProjectId = (projectId: string) => media.filter((m) => m.projectId === projectId);

/** Categories an image belongs to: its project's categories plus its own. */
export function getMediaCategories(m: PortfolioMedia): ProjectCategoryId[] {
  const fromProject = m.projectId ? (getProjectById(m.projectId)?.categories ?? []) : [];
  return [...new Set([...fromProject, ...(m.categoryIds ?? [])])];
}

export const getMediaByCategory = (categoryId: string) =>
  media.filter((m) => (getMediaCategories(m) as string[]).includes(categoryId));

/** The date used for ordering: capture date, else date added. Undefined if neither is valid. */
export function getMediaDate(m: PortfolioMedia): number | undefined {
  for (const value of [m.capturedAt, m.addedAt]) {
    const time = value ? Date.parse(value) : NaN;
    if (!Number.isNaN(time)) return time;
  }
  return undefined;
}

/** Dated images, newest first. Undated images are left out, never given invented dates. */
export function getRecentMedia(): PortfolioMedia[] {
  return media
    .map((m) => ({ m, time: getMediaDate(m) }))
    .filter((x): x is { m: PortfolioMedia; time: number } => x.time !== undefined)
    .sort((a, b) => b.time - a.time || (a.m.id < b.m.id ? -1 : 1))
    .map((x) => x.m);
}
