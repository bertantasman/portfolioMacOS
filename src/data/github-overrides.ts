import type { ProjectCategoryId } from "@/data/project-categories";

/**
 * Hand-made adjustments to how a GitHub repository appears in the portfolio. Everything is optional, and
 * only the fields set here change: the repository record itself is never copied. Identify a repository by
 * its numeric `repositoryId` (stable across renames) or by `repositoryFullName` ("owner/name").
 *
 * Example:
 *   { repositoryFullName: "octocat/Hello-World", featured: true, category: "web-development" }
 */
export interface RepositoryOverride {
  repositoryId?: number;
  repositoryFullName?: string;
  category?: ProjectCategoryId;
  featured?: boolean;
  /** Leaves the repository out of the portfolio entirely. */
  hidden?: boolean;
  displayName?: string;
  customDescription?: string;
}

export const repositoryOverrides: readonly RepositoryOverride[] = [
  // The GitHub profile README repository (named after the account) is not a project.
  { repositoryId: 739529864, hidden: true },
  // SmartHat is an empty repository (no code or documentation), so it is not presented as a project. Remove this
  // line once it has content.
  { repositoryId: 1264257996, hidden: true },
  // A repository the developer does not want shown anywhere in the portfolio.
  { repositoryId: 1446959960, hidden: true },

  // Categories set from what each repository demonstrably contains (see data/project-content/analysis.ts).
  // GitHub topics are empty for these repositories, so the automatic classification would file them all under "Other".
  { repositoryId: 962026935, category: "ios-development" }, // InstaClone: Swift, UIKit
  { repositoryId: 911678187, category: "ios-development" }, // MovieApp: Swift, UIKit
  { repositoryId: 911681469, category: "ios-development" }, // Contact-App: Swift, UIKit
  { repositoryId: 911682415, category: "ios-development" }, // Tech-Category-App: Swift, UIKit
  { repositoryId: 739096794, category: "android-development" }, // Math-Exam: Java, Android
  { repositoryId: 739478338, category: "android-development" }, // Number-Guess: Java, Android
  { repositoryId: 1178906645, category: "backend-development" }, // TaskFlow: microservices, API gateway
  { repositoryId: 1229286523, category: "artificial-intelligence" }, // GestureDeck: real-time hand tracking
  { repositoryId: 1432054028, category: "web-development" }, // portfolio: static website
];
