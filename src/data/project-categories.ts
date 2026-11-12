/** A category folder appears under Projects only when at least one project belongs to it. */
export const projectCategories = [
  { id: "ios-development", name: "iOS Development" },
  { id: "android-development", name: "Android Development" },
  { id: "web-development", name: "Web Development" },
  { id: "artificial-intelligence", name: "Artificial Intelligence" },
  { id: "backend-development", name: "Backend Development" },
  { id: "game-development", name: "Game Development" },
  { id: "institutional-mobile", name: "Institutional Mobile Application" },
  { id: "other", name: "Other" },
] as const;

export type ProjectCategoryId = (typeof projectCategories)[number]["id"];
