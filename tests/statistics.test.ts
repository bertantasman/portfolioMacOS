import assert from "node:assert/strict";
import { test } from "node:test";
import { projectAnalysis } from "@/data/project-content/analysis";
import { classifyFromSignals } from "@/lib/projects/classification";
import { deriveRegistry } from "@/lib/projects/registry";
import { STAT_CATEGORIES, classificationKeywords, computeStatistics, getDeveloperStatistics } from "@/lib/projects/statistics";
import type { ProjectAnalysis, ProjectSignals } from "@/types/project-analysis";
import { matchesFocus } from "@/features/statistics/lib/focus";
import { repo } from "./fixtures";

const noSignals: ProjectSignals = {
  xcodeProject: false, swiftFiles: 0, swiftUIImportFiles: 0, uiKitImportFiles: 0, androidApp: false, javaFiles: 0, kotlinFiles: 0,
  dartFiles: 0, flutterSdk: false, webEntryPoints: [], dependencies: [], mlLibraries: [],
};
const sig = (extra: Partial<ProjectSignals>): ProjectSignals => ({ ...noSignals, ...extra });

function analysis(id: number, over: Partial<ProjectAnalysis> = {}): ProjectAnalysis {
  return {
    projectId: `github:${id}`, repositoryName: `repo-${id}`, projectType: "learning-project", confidence: "high",
    evidence: [{ source: "x", note: "y" }], openQuestions: [], analyzedAt: "2026-01-01", hasPublicContent: true,
    hasReadme: false, isFork: false, signals: noSignals, platforms: [], frameworks: [], areas: [],
    classificationEvidence: {}, classificationConfidence: "high", classificationNotes: [], ...over,
  };
}
const stats = (repos: ReturnType<typeof repo>[], analyses: ProjectAnalysis[]) => computeStatistics(repos, deriveRegistry(repos), analyses);

// ── Classification: a language or a manifest alone never decides ──────────────────────────────

test("Swift alone is neither iOS nor SwiftUI nor UIKit", () => {
  const c = classifyFromSignals(sig({ swiftFiles: 12 }));
  assert.deepEqual([c.platforms, c.frameworks], [[], []]);
});

test("iOS needs an Xcode project, and UIKit or SwiftUI need real imports on top of it", () => {
  assert.deepEqual(classifyFromSignals(sig({ xcodeProject: true, swiftFiles: 5 })).frameworks, [], "iOS alone implies no framework");
  assert.deepEqual(classifyFromSignals(sig({ xcodeProject: true, swiftFiles: 5, uiKitImportFiles: 1 })).frameworks, [], "one incidental import is not substantive use");
  assert.deepEqual(classifyFromSignals(sig({ xcodeProject: true, swiftFiles: 5, uiKitImportFiles: 4 })).frameworks, ["uikit"]);
  assert.deepEqual(classifyFromSignals(sig({ swiftFiles: 5, uiKitImportFiles: 4 })).platforms, [], "UIKit imports without an Xcode project do not make an iOS app");
});

test("SwiftUI and UIKit are both counted when both are substantively used", () => {
  const c = classifyFromSignals(sig({ xcodeProject: true, swiftFiles: 20, swiftUIImportFiles: 6, uiKitImportFiles: 3 }));
  assert.deepEqual(c.frameworks.sort(), ["swiftui", "uikit"]);
});

test("Android needs a manifest, a Gradle build and source: Kotlin alone is not Android", () => {
  assert.deepEqual(classifyFromSignals(sig({ kotlinFiles: 30 })).platforms, []);
  assert.deepEqual(classifyFromSignals(sig({ androidApp: true })).platforms, [], "a manifest with no source is not an app");
  assert.deepEqual(classifyFromSignals(sig({ androidApp: true, javaFiles: 2 })).platforms, ["android"]);
});

test("Flutter needs the Flutter SDK dependency: Dart alone is not Flutter", () => {
  assert.deepEqual(classifyFromSignals(sig({ dartFiles: 12 })).frameworks, []);
  const c = classifyFromSignals(sig({ dartFiles: 12, flutterSdk: true }));
  assert.deepEqual([c.frameworks, c.platforms], [["flutter"], ["cross-platform"]]);
});

test("Web needs pages or a web framework: JavaScript or a package.json alone is not a web app or React", () => {
  assert.deepEqual(classifyFromSignals(sig({ dependencies: ["lodash", "jest"] })).platforms, []);
  assert.deepEqual(classifyFromSignals(sig({ dependencies: ["react"] })).frameworks, ["react"]);
  const full = classifyFromSignals(sig({ dependencies: ["next", "react", "express"], webEntryPoints: ["app/page.tsx"] }));
  assert.deepEqual(full.platforms.sort(), ["backend", "web"], "a full-stack app is both");
  assert.deepEqual(full.frameworks.sort(), ["express", "nextjs", "react"]);
});

test("a backend-only service is not a web app", () => {
  assert.deepEqual(classifyFromSignals(sig({ dependencies: ["express"] })).platforms, ["backend"]);
});

test("AI / ML needs a real ML library, not a mention", () => {
  assert.deepEqual(classifyFromSignals(sig({ dependencies: ["numpy", "opencv-python"] })).areas, []);
  assert.deepEqual(classifyFromSignals(sig({ mlLibraries: ["mediapipe"] })).areas, ["computer-vision"]);
});

// ── Counting ────────────────────────────────────────────────────────────────────────────────

test("an empty repository list gives zeros, not errors", () => {
  const s = stats([], []);
  assert.equal(s.totalProjects, 0);
  assert.equal(s.scope.repositoriesInScope, 0);
  assert.deepEqual(s.technologies, []);
});

test("each project counts once per category, and overlapping categories do not add up to the total", () => {
  const repos = [repo(1, "a"), repo(2, "b"), repo(3, "c")];
  const s = stats(repos, [
    analysis(1, { platforms: ["ios"], frameworks: ["uikit"] }),
    analysis(2, { platforms: ["ios"], frameworks: ["swiftui", "uikit"] }),
    analysis(3, { platforms: ["web", "backend"], frameworks: ["express"] }),
  ]);
  assert.equal(s.totalProjects, 3);
  assert.equal(s.iosProjects, 2);
  assert.equal(s.uiKitProjects, 2);
  assert.equal(s.swiftUIProjects, 1);
  assert.equal(s.webProjects, 1);
  assert.equal(s.backendProjects, 1);
  const sum = Object.values(s.categoryCounts).reduce((a, b) => a + b, 0);
  assert.ok(sum > s.totalProjects, "multi-category projects are counted in each of their categories");
});

test("the same repository id is never counted twice, even if it appears twice", () => {
  const dup = [repo(1, "a"), repo(1, "a-renamed")];
  const s = stats(dup, [analysis(1, { platforms: ["ios"] })]);
  assert.equal(s.scope.repositoriesInScope, 1);
  assert.equal(s.totalProjects, 1);
  assert.equal(s.iosProjects, 1);
});

test("forks, empty and non-project repositories are excluded with a reason, not counted", () => {
  const repos = [repo(1, "own"), repo(2, "forked", { isFork: true }), repo(3, "empty"), repo(4, "profile")];
  const s = stats(repos, [analysis(1, { platforms: ["web"] }), analysis(2, { platforms: ["ios"] }), analysis(3, { projectType: "empty" }), analysis(4, { projectType: "not-a-project" })]);
  assert.equal(s.totalProjects, 1);
  assert.equal(s.iosProjects, 0, "a fork's platform is never attributed to the owner");
  assert.deepEqual(s.scope.excluded.map((e) => e.reason).sort(), ["Empty repository", "Fork of another developer's project", "Not a project"]);
});

test("a repository with no analysis is pending: not guessed from GitHub's language, and not counted", () => {
  const s = stats([repo(1, "known"), repo(2, "brand-new", { primaryLanguage: "Swift", topics: ["ios"] })], [analysis(1, { platforms: ["web"] })]);
  assert.deepEqual(s.scope.pending.map((p) => p.name), ["brand-new"]);
  assert.equal(s.totalProjects, 1);
  assert.equal(s.iosProjects, 0);
  assert.equal(s.scope.analyzed, 1);
});

test("statistics follow a refresh: a newly analysed repository is counted, a removed one is not", () => {
  const a = [analysis(1, { platforms: ["ios"] }), analysis(2, { platforms: ["ios"] })];
  assert.equal(stats([repo(1, "a")], a).iosProjects, 1);
  assert.equal(stats([repo(1, "a"), repo(2, "b")], a).iosProjects, 2);
  assert.equal(stats([repo(2, "b")], a).iosProjects, 1);
});

test("technologies are counted once per project, with aliases merged", () => {
  // Content for the real ids supplies technology names; InstaClone lists three Firebase services.
  const repos = [repo(962026935, "InstaClone")];
  const s = stats(repos, projectAnalysis.filter((a) => a.projectId === "github:962026935"));
  assert.equal(s.technologyCounts["Firebase"], 1, "three Firebase services count as one technology in one project");
  assert.equal(s.technologyCounts["Swift"], 1);
  assert.equal(s.technologyCounts["Firebase Authentication"], undefined);
});

test("unknown technologies are never invented: only names from the written content are counted", () => {
  const s = stats([repo(1, "a", { primaryLanguage: "Kotlin", topics: ["flutter"] })], [analysis(1)]);
  assert.deepEqual(s.technologyCounts, {});
});

test("results are cached per repository list", () => {
  const list = [repo(1, "a")];
  assert.equal(getDeveloperStatistics(list), getDeveloperStatistics(list));
});

test("filtering: a focus keeps only matching projects, and clearing it restores everything", () => {
  const repos = [repo(1, "a"), repo(2, "b")];
  const s = stats(repos, [analysis(1, { platforms: ["ios"], frameworks: ["uikit"] }), analysis(2, { platforms: ["android"] })]);
  const ids = [...s.byProject.keys()];
  assert.equal(ids.filter((id) => matchesFocus(s, id, { kind: "category", id: "ios" })).length, 1);
  assert.equal(ids.filter((id) => matchesFocus(s, id, { kind: "category", id: "uikit" })).length, 1);
  assert.equal(ids.filter((id) => matchesFocus(s, id, { kind: "category", id: "android" })).length, 1);
  assert.equal(ids.filter((id) => matchesFocus(s, id, null)).length, ids.length);
  assert.equal(matchesFocus(s, "curated-project-without-classification", { kind: "category", id: "ios" }), false);
});

// ── The real dataset ────────────────────────────────────────────────────────────────────────

const realRepos = projectAnalysis.map((a) => repo(Number(a.projectId.replace("github:", "")), a.repositoryName, { isFork: a.isFork }));

test("real data: every stored classification follows from its stored evidence", () => {
  const manualPlatforms = new Set(["desktop", "other"]);
  const manualFrameworks = new Set(["android-views"]);
  const manualAreas = new Set(["image-processing", "distributed-systems"]);
  for (const a of projectAnalysis) {
    const d = classifyFromSignals(a.signals);
    for (const p of d.platforms) assert.ok(a.platforms.includes(p), `${a.repositoryName}: evidence implies ${p}`);
    for (const f of d.frameworks) assert.ok(a.frameworks.includes(f), `${a.repositoryName}: evidence implies ${f}`);
    for (const x of d.areas) assert.ok(a.areas.includes(x), `${a.repositoryName}: evidence implies ${x}`);
    // ...and nothing is stored beyond what the rules derive, except the few judged by hand.
    for (const p of a.platforms) assert.ok(d.platforms.includes(p) || manualPlatforms.has(p), `${a.repositoryName}: ${p} has no evidence`);
    for (const f of a.frameworks) assert.ok(d.frameworks.includes(f) || manualFrameworks.has(f), `${a.repositoryName}: ${f} has no evidence`);
    for (const x of a.areas) assert.ok(d.areas.includes(x) || manualAreas.has(x), `${a.repositoryName}: ${x} has no evidence`);
  }
});

test("real data: every assigned value has an evidence note, and low-confidence work is flagged", () => {
  for (const a of projectAnalysis) {
    const values = [...a.platforms, ...a.frameworks, ...a.areas];
    for (const v of values) assert.ok(a.classificationEvidence[v]?.trim(), `${a.repositoryName}: no evidence for ${v}`);
    for (const k of Object.keys(a.classificationEvidence)) assert.ok(values.includes(k as never), `${a.repositoryName}: evidence for unassigned ${k}`);
    if (a.classificationConfidence === "low") assert.ok(a.classificationNotes.length > 0, `${a.repositoryName}: low confidence needs a note`);
  }
});

test("real data: no unverified technology is claimed (no SwiftUI, Flutter, React or Next.js without evidence)", () => {
  const s = stats(realRepos, [...projectAnalysis]);
  for (const f of ["swiftui", "flutter", "react", "nextjs"] as const) {
    const expected = projectAnalysis.filter((a) => a.frameworks.includes(f)).length;
    assert.equal(s.categoryCounts[f], expected);
    if (expected > 0) assert.ok(projectAnalysis.some((a) => a.signals.swiftUIImportFiles > 0 || a.signals.flutterSdk || a.signals.dependencies.length > 0));
  }
  assert.equal(s.swiftUIProjects, projectAnalysis.filter((a) => a.signals.swiftUIImportFiles >= 2).length);
  assert.equal(s.flutterProjects, projectAnalysis.filter((a) => a.signals.flutterSdk).length);
});

test("real data: scope numbers add up (counted + pending + excluded = repositories in scope)", () => {
  const s = stats(realRepos, [...projectAnalysis]);
  assert.equal(s.scope.repositoriesInScope, projectAnalysis.length);
  assert.equal(s.scope.counted + s.scope.pending.length + s.scope.excluded.length, s.scope.repositoriesInScope);
  assert.equal(s.scope.analyzed, projectAnalysis.length);
  assert.equal(s.totalProjects, projectAnalysis.filter((a) => a.hasPublicContent && !a.isFork && a.projectType !== "empty").length);
});

test("real data: Spotlight keywords come only from verified categories", () => {
  const s = stats(realRepos, [...projectAnalysis]);
  const all = [...s.byProject.values()].flatMap(classificationKeywords).map((k) => k.toLowerCase());
  assert.ok(all.includes("uikit"));
  assert.ok(!all.includes("swiftui"));
  assert.ok(!all.includes("flutter"));
  assert.ok(STAT_CATEGORIES.length > 0);
});
