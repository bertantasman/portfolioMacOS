import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveRegistry, matchesRepository, selectFeatured } from "@/lib/projects/registry";
import type { PortfolioProject } from "@/types/project";
import { repo } from "./fixtures";

const curated = (extra: Partial<PortfolioProject> = {}): PortfolioProject => ({
  id: "my-app",
  slug: "my-app",
  title: "My App",
  shortDescription: "Hand-written description.",
  categories: ["web-development"],
  ...extra,
});

test("repositories become projects with the numeric id as the stable identity", () => {
  const registry = deriveRegistry([repo(10, "alpha"), repo(11, "beta")]);
  assert.ok(registry.byId.has("github:10"));
  assert.ok(registry.byId.has("github:11"));
  assert.equal(registry.projectIdByRepositoryId.get(10), "github:10");
});

test("a rename keeps the project id and updates what is shown", () => {
  const before = deriveRegistry([repo(10, "alpha")]).byId.get("github:10");
  const after = deriveRegistry([repo(10, "alpha-renamed", { fullName: "octocat/alpha-renamed" })]).byId.get("github:10");
  assert.equal(before?.title, "alpha");
  assert.equal(after?.title, "alpha-renamed");
  assert.equal(after?.repository?.fullName, "octocat/alpha-renamed");
});

test("the registry is cached per repository list, so unchanged data is not re-derived", () => {
  const list = [repo(1, "a")];
  assert.equal(deriveRegistry(list), deriveRegistry(list));
  assert.notEqual(deriveRegistry(list), deriveRegistry([repo(1, "a")]));
});

test("forks stay out of the project list but remain in `all`", () => {
  const registry = deriveRegistry([repo(1, "original"), repo(2, "forked", { isFork: true })]);
  assert.ok(registry.projects.every((p) => p.id !== "github:2"));
  assert.ok(registry.all.some((p) => p.id === "github:2"));
});

test("a repository with no description gets an empty one, never an invented one", () => {
  const p = deriveRegistry([repo(1, "bare", { description: null })]).byId.get("github:1");
  assert.equal(p?.shortDescription, "");
});

test("a curated project links by numeric id, which survives a rename", () => {
  const project = curated({ githubRepositoryId: 77 });
  assert.equal(matchesRepository(project, repo(77, "totally-different-name"), ""), true);
  assert.equal(matchesRepository(project, repo(78, "my-app"), ""), false, "same name, different repository");
});

test("an explicit link is never overridden by a similar name", () => {
  const project = curated({ githubRepository: "octocat/other" });
  assert.equal(matchesRepository(project, repo(5, "my-app"), "octocat/other"), false);
  assert.equal(matchesRepository(project, repo(6, "other"), "octocat/other"), true);
});

test("only a curated project with no link at all falls back to matching by name", () => {
  assert.equal(matchesRepository(curated(), repo(1, "My-App"), ""), true);
  assert.equal(matchesRepository(curated(), repo(1, "my-app-2"), ""), false);
});

test("curated projects are kept and listed first, without duplicates for their repository", () => {
  const registry = deriveRegistry([repo(1, "macos-portfolio"), repo(2, "unrelated")]);
  const ids = registry.projects.map((p) => p.id);
  assert.equal(ids.filter((id) => id === "macos-portfolio").length, 1);
  assert.ok(!ids.includes("github:1"), "the curated project absorbed its repository");
  assert.equal(registry.projectIdByRepositoryId.get(1), "macos-portfolio");
  assert.ok(ids.indexOf("macos-portfolio") < ids.indexOf("github:2"));
  // The curated description is not replaced by GitHub's.
  assert.equal(registry.byId.get("macos-portfolio")?.shortDescription, "The interactive macOS-inspired portfolio currently being developed.");
});

test("the featured list is configured: CourtRise, BuGunluk, GeoAttend, LineMaster, and no other project is hidden", () => {
  const registry = deriveRegistry([repo(1, "a")]);
  const { configured, projects } = selectFeatured(registry, 5);
  assert.equal(configured, true);
  assert.deepEqual(projects.map((p) => p.id), ["courtrise", "bugunluk", "geoattend", "linemaster"]);
  assert.ok(registry.projects.length > 4, "featuring does not remove other projects");
});

test("categories come from real topics only", () => {
  const registry = deriveRegistry([repo(1, "x", { topics: ["swiftui"], primaryLanguage: "Swift" }), repo(2, "y", { primaryLanguage: "Swift" })]);
  assert.deepEqual(registry.byId.get("github:1")?.categories, ["ios-development"]);
  assert.deepEqual(registry.byId.get("github:2")?.categories, ["other"]);
});
