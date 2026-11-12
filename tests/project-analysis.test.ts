import assert from "node:assert/strict";
import { test } from "node:test";
import { projectAnalysis } from "@/data/project-content/analysis";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { ANALYSIS_CONFIDENCE, PROJECT_AREAS, PROJECT_FRAMEWORKS, PROJECT_PLATFORMS, PROJECT_TYPES } from "@/types/project-analysis";
import { PROJECT_STATUSES, TECHNOLOGY_CATEGORIES } from "@/types/project-content";
import { repo } from "./fixtures";

const words = (s: string) => s.trim().split(/\s+/).length;
const githubContent = curatedContent.filter((c) => c.projectId.startsWith("github:"));

test("analysis records have unique stable ids and valid classifications", () => {
  const ids = projectAnalysis.map((a) => a.projectId);
  assert.equal(new Set(ids).size, ids.length, "duplicate analysis entries");
  for (const a of projectAnalysis) {
    assert.match(a.projectId, /^github:\d+$/);
    assert.ok(PROJECT_TYPES.includes(a.projectType), a.projectId);
    assert.ok(ANALYSIS_CONFIDENCE.includes(a.confidence), a.projectId);
    assert.ok(a.evidence.length > 0, `${a.repositoryName} has no evidence`);
    for (const e of a.evidence) assert.ok(e.source.trim() && e.note.trim());
    assert.match(a.analyzedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("every analysis with public content has exactly one content entry, and no content is orphaned", () => {
  const contentIds = githubContent.map((c) => c.projectId);
  assert.equal(new Set(contentIds).size, contentIds.length, "duplicate content entries");
  const expected = projectAnalysis.filter((a) => a.hasPublicContent).map((a) => a.projectId).sort();
  assert.deepEqual([...contentIds].sort(), expected);
});

test("summaries are plain strings of a sensible length (or a short, honest note for empty repositories)", () => {
  for (const c of githubContent) {
    const a = projectAnalysis.find((x) => x.projectId === c.projectId)!;
    assert.equal(typeof c.tagline, "string", c.projectId);
    const n = words(c.tagline!);
    if (a.projectType === "empty") assert.ok(n >= 10 && n <= 45, `${c.projectId}: ${n} words`);
    else assert.ok(n >= 25 && n <= 50, `${c.projectId}: ${n} words`);
    assert.doesNotMatch(c.tagline!, /\b(cutting-edge|revolutioni[sz]e|seamless|innovative)\b/i, `${c.projectId} uses marketing language`);
  }
});

test("technologies are normalized: unique, trimmed, known categories", () => {
  for (const c of githubContent) {
    const names = (c.technologies ?? []).map((t) => t.name);
    assert.equal(new Set(names.map((n) => n.toLowerCase())).size, names.length, `${c.projectId} repeats a technology`);
    for (const t of c.technologies ?? []) {
      assert.equal(t.name, t.name.trim());
      assert.ok(t.name.length > 0);
      if (t.category) assert.ok(TECHNOLOGY_CATEGORIES.includes(t.category), `${c.projectId}/${t.name}`);
    }
    if (c.developmentStatus) assert.ok(PROJECT_STATUSES.includes(c.developmentStatus));
  }
});

test("technology spelling is consistent across projects", () => {
  const byLower = new Map<string, Set<string>>();
  for (const c of githubContent) for (const t of c.technologies ?? []) (byLower.get(t.name.toLowerCase()) ?? byLower.set(t.name.toLowerCase(), new Set()).get(t.name.toLowerCase())!).add(t.name);
  for (const [key, spellings] of byLower) assert.equal(spellings.size, 1, `"${key}" is spelled ${[...spellings].join(" / ")}`);
});

test("feature ids are unique within a project", () => {
  for (const c of githubContent) {
    const ids = (c.features ?? []).map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length, c.projectId);
  }
});

test("content reaches the registry by repository id, even after a rename; hidden and fork rules still apply", () => {
  const registry = deriveRegistry([
    repo(1229286523, "AI_DJ", { description: "elle şarkı kontrol" }),
    repo(739529864, "bertantasman", { description: "Config files for my GitHub profile." }),
    repo(601302440, "Programlamaya-Giris", { isFork: true }),
  ]);
  const dj = registry.byId.get("github:1229286523");
  assert.equal(dj?.title, "GestureDeck");
  assert.equal(dj?.shortDescription, curatedContent.find((c) => c.projectId === "github:1229286523")?.tagline);
  assert.ok(dj?.longDescription?.includes("webcam"));
  assert.equal(registry.byId.has("github:739529864"), false, "the profile README repository is hidden");
  assert.ok(registry.all.some((p) => p.id === "github:601302440"), "the fork is still known");
  assert.ok(!registry.projects.some((p) => p.id === "github:601302440"), "but not listed as a project");

  const renamed = deriveRegistry([repo(1229286523, "GestureDeck-renamed", { fullName: "octocat/GestureDeck-renamed" })]);
  assert.equal(renamed.byId.get("github:1229286523")?.title, "GestureDeck");
});

test("a repository with no description still gets the written summary, and GitHub facts stay GitHub's", () => {
  const p = deriveRegistry([repo(998793837, "ImageProcessing", { description: null, primaryLanguage: "Jupyter Notebook", stars: 3 })]).byId.get("github:998793837");
  assert.ok(p?.shortDescription.length);
  assert.equal(p?.repository?.primaryLanguage, "Jupyter Notebook");
  assert.equal(p?.repository?.stars, 3);
});

test("every repository override points at an analysed repository, and categories reach the registry", async () => {
  const { repositoryOverrides } = await import("@/data/github-overrides");
  const known = new Set(projectAnalysis.map((a) => a.projectId));
  // A hidden repository never reaches the portfolio, so it needs no written analysis (and none is kept for it).
  for (const o of repositoryOverrides.filter((o) => !o.hidden)) assert.ok(o.repositoryId !== undefined && known.has(`github:${o.repositoryId}`), `override for ${o.repositoryId} has no analysis`);
  const p = deriveRegistry([repo(962026935, "InstaClone", { topics: [] })]).byId.get("github:962026935");
  assert.deepEqual(p?.categories, ["ios-development"]);
});

test("statistics fields use known values and agree with the written technologies", () => {
  const techs = (id: string) => new Set((githubContent.find((c) => c.projectId === id)?.technologies ?? []).map((t) => t.name));
  for (const a of projectAnalysis) {
    for (const p of a.platforms) assert.ok(PROJECT_PLATFORMS.includes(p), `${a.repositoryName}: ${p}`);
    for (const f of a.frameworks) assert.ok(PROJECT_FRAMEWORKS.includes(f), `${a.repositoryName}: ${f}`);
    for (const x of a.areas) assert.ok(PROJECT_AREAS.includes(x), `${a.repositoryName}: ${x}`);
    assert.equal(typeof a.hasReadme, "boolean");
    assert.equal(typeof a.isFork, "boolean");
    if (!a.hasPublicContent) continue;
    const t = techs(a.projectId);
    // A framework is only recorded when the public technology list names it too.
    if (a.frameworks.includes("uikit")) assert.ok(t.has("UIKit"), a.repositoryName);
    if (a.frameworks.includes("swiftui")) assert.ok(t.has("SwiftUI"), a.repositoryName);
    if (a.frameworks.includes("flutter")) assert.ok(t.has("Flutter"), a.repositoryName);
    if (a.platforms.includes("ios")) assert.ok(t.has("Swift"), a.repositoryName);
    if (a.platforms.includes("android")) assert.ok(t.has("Android"), a.repositoryName);
    // Forks never count as the owner's own platform or area work.
    if (a.isFork) assert.deepEqual([a.platforms.length, a.frameworks.length, a.areas.length], [0, 0, 0]);
  }
});

test("platform and category agree for the mobile projects", async () => {
  const { repositoryOverrides } = await import("@/data/github-overrides");
  for (const a of projectAnalysis) {
    const id = Number(a.projectId.replace("github:", ""));
    const category = repositoryOverrides.find((o) => o.repositoryId === id)?.category;
    if (a.platforms.includes("ios")) assert.equal(category, "ios-development", a.repositoryName);
    if (a.platforms.includes("android")) assert.equal(category, "android-development", a.repositoryName);
  }
});
