import assert from "node:assert/strict";
import { test } from "node:test";
import type { PortfolioDocument } from "@/data/documents";
import { profile as realProfile, type DeveloperProfile } from "@/data/profile";
import { buildContentAudit, formatContentAudit } from "@/lib/portfolio/audit";
import { formatDateRange, parseProfileDate, sortNewestFirst } from "@/lib/profile/format";
import { validateProfile } from "@/lib/profile/validate";
import { deriveRegistry } from "@/lib/projects/registry";
import type { PortfolioMedia } from "@/types/media";
import type { PortfolioProject } from "@/types/project";
import { repo } from "./fixtures";

const project = (id: string, extra: Partial<PortfolioProject> = {}): PortfolioProject => ({
  id,
  slug: id,
  title: id,
  shortDescription: "A description.",
  categories: ["web-development"],
  source: "curated",
  ...extra,
});
const image = (id: string, extra: Partial<PortfolioMedia> = {}): PortfolioMedia => ({ id, src: `/shots/${id}.png`, title: id, alt: id, width: 10, height: 10, ...extra });
const resumeDoc: PortfolioDocument = { id: "resume", title: "Resume", filename: "Resume.pdf", src: "/documents/Resume.pdf", mimeType: "application/pdf" };

const base = (extra: Partial<Parameters<typeof buildContentAudit>[0]> = {}) => {
  const curated = [project("a"), project("b")];
  return { registry: deriveRegistry([repo(1, "gh-one"), repo(2, "gh-two")]), curated, profile: realProfile, media: [], documents: [resumeDoc], ...extra };
};
const messages = (a: ReturnType<typeof buildContentAudit>) => a.issues.map((i) => i.message);

test("counts come from the real data", () => {
  const a = buildContentAudit(base());
  assert.equal(a.counts.githubRepositories, 2);
  assert.equal(a.counts.curatedProjects, 2);
  assert.equal(a.counts.mediaItems, 0);
});

test("duplicate ids, bad URLs and broken media references are errors", () => {
  const curated = [project("dup"), project("dup"), project("c", { liveUrl: "javascript:alert(1)" })];
  const media = [image("m1", { projectId: "nope" }), image("m1")];
  const text = messages(buildContentAudit(base({ curated, media }))).join("\n");
  assert.match(text, /Duplicate project id "dup"/);
  assert.match(text, /Duplicate media id "m1"/);
  assert.match(text, /liveUrl "javascript:alert\(1\)" is not a valid URL/);
  assert.match(text, /Media "m1" references unknown project "nope"/);
});

test("a GitHub-backed media reference is only judged once GitHub data has loaded", () => {
  const media = [image("m", { projectId: "github:999" })];
  assert.equal(messages(buildContentAudit(base({ media }))).some((m) => m.includes("github:999")), false);
  assert.equal(messages(buildContentAudit(base({ media, repositoriesLoaded: true }))).some((m) => m.includes("github:999")), true);
});

test("missing files are reported when they can be checked, and skipped when they can't", () => {
  const media = [image("m")];
  const checked = messages(buildContentAudit(base({ media, fileExists: () => false }))).join("\n");
  assert.match(checked, /file \/shots\/m\.png does not exist/);
  assert.match(checked, /file \/documents\/Resume\.pdf is missing/);
  const unchecked = messages(buildContentAudit(base({ media }))).join("\n");
  assert.doesNotMatch(unchecked, /does not exist|is missing/);
});

test("projects without descriptions or screenshots are counted", () => {
  const registry = deriveRegistry([repo(1, "bare", { description: null }), repo(2, "described")]);
  const text = messages(buildContentAudit(base({ registry, media: [image("m", { projectId: "github:2" })] }))).join("\n");
  assert.match(text, /1 project has no description: bare/);
  // Every visible project except the one with a screenshot (the registry also holds the real curated projects).
  assert.match(text, new RegExp(`${registry.projects.length - 1} projects have no screenshots`));
});

test("a curated project and an unlinked GitHub project with the same title are flagged as a possible duplicate", () => {
  const registry = deriveRegistry([repo(1, "Weather App")]);
  const curated = [project("weather", { title: "weather app", slug: "weather", githubRepository: "octocat/something-else" })];
  assert.match(messages(buildContentAudit(base({ registry, curated }))).join("\n"), /both a curated project \(weather\) and a separate GitHub project/);
});

test("a curated link that no loaded repository answered to is reported", () => {
  const registry = deriveRegistry([]);
  const curated = [project("a", { githubRepositoryId: 123 })];
  assert.match(messages(buildContentAudit(base({ registry, curated, repositoriesLoaded: true }))).join("\n"), /not found \(renamed, private or mistyped\)/);
});

test("unconfigured profile information is listed, and the text report shows real counts", () => {
  // An empty profile, so the result does not depend on what is configured in this repository.
  const bare: DeveloperProfile = { ...realProfile, email: undefined, socialLinks: {} };
  const audit = buildContentAudit(base({ profile: bare }));
  const text = formatContentAudit(audit);
  assert.match(text, /^Portfolio Content Audit/);
  assert.match(text, /- 2 GitHub repositories/);
  assert.match(text, /No github profile URL is configured/);
});

test("profile references to projects, skills and documents are checked", () => {
  const p: DeveloperProfile = {
    ...realProfile,
    skillGroups: [{ id: "g", name: "G", skills: ["Swift"] }],
    featuredSkills: ["Swift", "Ghost"],
    skillProjects: { Swift: ["missing-project"], Nope: [] },
    experience: [
      { id: "e", organization: "O", role: "R", startDate: "2020-13", projectIds: ["missing-project"] },
      { id: "e", organization: "O2", role: "R2", current: true, endDate: "2021" },
    ],
    resume: { documentId: "no-such-document" },
    email: "nope",
  };
  const text = validateProfile(p, new Set(["a"])).map((i) => `${i.path}: ${i.message}`).join("\n");
  assert.match(text, /Duplicate id "e"/);
  assert.match(text, /startDate: "2020-13"/);
  assert.match(text, /experience\.e\.projectIds: Unknown project "missing-project"/);
  assert.match(text, /skillProjects\.Swift: Unknown project/);
  assert.match(text, /"Ghost" is not listed in any skill group/);
  assert.match(text, /No document "no-such-document"/);
  assert.match(text, /not a valid email/);
  assert.match(text, /current position should not have an end date/);
});

test("partial dates are never completed, and ongoing is only shown when stated", () => {
  assert.equal(formatDateRange("2020", "2022"), "2020 – 2022");
  assert.equal(formatDateRange("2020-09", undefined), "From September 2020");
  assert.equal(formatDateRange("2020-09", undefined, true), "September 2020 – Present");
  assert.equal(parseProfileDate("2021-02-30"), undefined);
  assert.deepEqual(sortNewestFirst([{ endDate: "2019" }, { current: true }, { endDate: "2022" }]).map((e) => e.endDate ?? "current"), ["current", "2022", "2019"]);
});
