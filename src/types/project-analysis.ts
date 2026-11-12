/**
 * The developer-facing record behind a project's written content: what it was based on and how sure the
 * analysis is. It is never shown to visitors (the polished text lives in data/project-content/curated.ts).
 */
export const ANALYSIS_CONFIDENCE = ["high", "medium", "low"] as const;
export type AnalysisConfidence = (typeof ANALYSIS_CONFIDENCE)[number];

export const PROJECT_TYPES = [
  "application",
  "prototype",
  "academic-project",
  "learning-project",
  "library-or-tool",
  "website",
  "fork",
  "not-a-project",
  "empty",
] as const;
export type AnalysisProjectType = (typeof PROJECT_TYPES)[number];

/**
 * Facts that a statistics view can count without re-reading prose. Each value is recorded only when a file in
 * the repository proves it (see `evidence`), so a project simply has fewer entries when less is known.
 */
export const PROJECT_PLATFORMS = ["ios", "android", "web", "desktop", "cross-platform", "backend", "other"] as const;
export type ProjectPlatform = (typeof PROJECT_PLATFORMS)[number];

/** UI or application frameworks actually used. Swift alone never implies one of these. */
export const PROJECT_FRAMEWORKS = ["uikit", "swiftui", "flutter", "jetpack-compose", "android-views", "react", "nextjs", "express"] as const;
export type ProjectFramework = (typeof PROJECT_FRAMEWORKS)[number];

/** Subject areas, recorded narrowly: classical image processing is not machine learning. */
export const PROJECT_AREAS = ["computer-vision", "image-processing", "machine-learning", "nlp", "distributed-systems"] as const;
export type ProjectArea = (typeof PROJECT_AREAS)[number];

/**
 * What was actually found in a repository, as plain facts. Platforms and frameworks are derived from these by
 * `classifyFromSignals` (lib/projects/classification.ts), so a classification can always be traced to a file.
 */
export interface ProjectSignals {
  /** An Xcode project (.xcodeproj / project.pbxproj) is present. */
  xcodeProject: boolean;
  swiftFiles: number;
  /** Swift files (outside Pods) that `import SwiftUI`. */
  swiftUIImportFiles: number;
  /** Swift files (outside Pods) that `import UIKit`. */
  uiKitImportFiles: number;
  /** An AndroidManifest.xml and a Gradle build file are present. */
  androidApp: boolean;
  javaFiles: number;
  kotlinFiles: number;
  dartFiles: number;
  /** A pubspec.yaml that depends on the Flutter SDK. */
  flutterSdk: boolean;
  /** Web pages that are application or site entry points (not docs or fixtures). */
  webEntryPoints: readonly string[];
  /** Dependencies found in package.json files or equivalent manifests, e.g. "react", "next", "express". */
  dependencies: readonly string[];
  /** Machine-learning or vision libraries imported by the code, e.g. "mediapipe". */
  mlLibraries: readonly string[];
}

export interface ProjectEvidence {
  /** Where the claim comes from: a file path in the repository, or another named source. */
  source: string;
  /** What that source shows. */
  note: string;
}

export interface ProjectAnalysis {
  /** `github:<repository id>` (stable across renames), or a curated project id. */
  projectId: string;
  /** The repository's name when it was analysed, for readers of the report. */
  repositoryName: string;
  projectType: AnalysisProjectType;
  confidence: AnalysisConfidence;
  evidence: readonly ProjectEvidence[];
  /** Things the repository does not answer; a human should confirm or add them. */
  openQuestions: readonly string[];
  /** ISO date of the analysis. */
  analyzedAt: string;
  /** Public text is written for this project. False for repositories that are not projects. */
  hasPublicContent: boolean;
  /** The repository has a README file. */
  hasReadme: boolean;
  /** The repository is a fork of someone else's project. */
  isFork: boolean;
  /** The raw findings the classification below is derived from. */
  signals: ProjectSignals;
  platforms: readonly ProjectPlatform[];
  frameworks: readonly ProjectFramework[];
  areas: readonly ProjectArea[];
  /** Why each assigned platform, framework or area applies, keyed by its value. Every assignment needs one. */
  classificationEvidence: Readonly<Record<string, string>>;
  /** How sure the classification is (separate from how well the project's purpose is documented). */
  classificationConfidence: AnalysisConfidence;
  /** Uncertainty to resolve by hand; such projects are flagged in the statistics report. */
  classificationNotes: readonly string[];
}
