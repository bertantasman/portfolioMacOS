import type { ProjectArea, ProjectFramework, ProjectPlatform, ProjectSignals } from "@/types/project-analysis";

/** Imports of a UI framework must appear in at least this many files to count as real use, not an incidental import. */
export const SUBSTANTIVE_IMPORT_FILES = 2;

const ML_LIBRARIES: Record<string, ProjectArea> = {
  mediapipe: "computer-vision",
  tensorflow: "machine-learning",
  torch: "machine-learning",
  pytorch: "machine-learning",
  "scikit-learn": "machine-learning",
  sklearn: "machine-learning",
  transformers: "nlp",
  nltk: "nlp",
  spacy: "nlp",
};

const SERVER_FRAMEWORKS = ["express", "fastify", "koa", "fastapi", "django", "flask", "spring-boot"];

export interface DerivedClassification {
  platforms: ProjectPlatform[];
  frameworks: ProjectFramework[];
  /** Only the areas that libraries prove. Areas like image processing are judged by hand. */
  areas: ProjectArea[];
}

/**
 * The classification rules. Each one needs direct evidence, so a language alone never decides anything:
 * Swift does not imply SwiftUI or even iOS, Kotlin does not imply Android, Dart does not imply Flutter, and
 * JavaScript or a package.json does not imply a web app or React.
 */
export function classifyFromSignals(s: ProjectSignals): DerivedClassification {
  const platforms: ProjectPlatform[] = [];
  const frameworks: ProjectFramework[] = [];
  const areas: ProjectArea[] = [];
  const deps = new Set(s.dependencies.map((d) => d.toLowerCase()));

  const ios = s.xcodeProject && s.swiftFiles > 0;
  if (ios) platforms.push("ios");
  if (ios && s.uiKitImportFiles >= SUBSTANTIVE_IMPORT_FILES) frameworks.push("uikit");
  if (ios && s.swiftUIImportFiles >= SUBSTANTIVE_IMPORT_FILES) frameworks.push("swiftui");

  const android = s.androidApp && s.javaFiles + s.kotlinFiles > 0;
  if (android) platforms.push("android");

  const flutter = s.flutterSdk && s.dartFiles > 0;
  if (flutter) {
    frameworks.push("flutter");
    platforms.push("cross-platform");
  }

  const react = deps.has("react");
  const next = deps.has("next");
  if (react) frameworks.push("react");
  if (next) frameworks.push("nextjs");
  if (s.webEntryPoints.length > 0 || react || next) platforms.push("web");

  const server = SERVER_FRAMEWORKS.find((f) => deps.has(f));
  if (server) {
    platforms.push("backend");
    if (server === "express") frameworks.push("express");
  }

  for (const lib of s.mlLibraries) {
    const area = ML_LIBRARIES[lib.toLowerCase()];
    if (area && !areas.includes(area)) areas.push(area);
  }
  return { platforms, frameworks, areas };
}
