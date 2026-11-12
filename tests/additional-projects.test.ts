import assert from "node:assert/strict";
import test from "node:test";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";
import { profile } from "@/data/profile";

const registry = deriveRegistry([]);
const ids = ["readpoint", "chickenflip", "courtrise-web", "bugunluk-web", "parsing-face-color", "pos-tracking-system"];
const get = (id: string) => registry.byId.get(id)!;
const text = (id: string) => JSON.stringify(curatedContent.find((c) => c.projectId === id)) + JSON.stringify(get(id));

test("each added project has exactly one record, a description shared across apps, and no repository link", () => {
  for (const id of ids) {
    assert.ok(get(id), `${id} is missing`);
    assert.equal(registry.all.filter((p) => p.id === id).length, 1);
    assert.equal(curatedContent.filter((c) => c.projectId === id).length, 1);
    assert.equal(get(id).shortDescription, get(id).tagline);
    const d = getProjectDetail(get(id));
    assert.ok(!d.links.some((l) => l.kind === "github"), `${id} must not link a private repository`);
    assert.ok(d.technologies.length > 0 && d.features.length >= 4 && d.technicalDetails.length > 0, `${id} is thin`);
    assert.ok(d.caseStudy?.summary?.length, `${id} has no summary strip`);
    assert.equal(d.caseStudy!.summary![0].label, "Role");
  }
});

test("ReadPoint is published on the App Store and states no ratings, downloads or revenue", () => {
  const d = getProjectDetail(get("readpoint"));
  assert.equal(d.links.find((l) => l.kind === "appStore")?.url, "https://apps.apple.com/tr/app/readpoint/id6758308888");
  assert.equal(d.status?.label, "Published on the App Store");
  assert.doesNotMatch(text("readpoint"), /\b\d[\d,.]*\s*(downloads|users|ratings|reviews)\b|\b5\.0\b|revenue (of|was)/i);
});

test("CourtRise Web links its live site, and only that", () => {
  const d = getProjectDetail(get("courtrise-web"));
  assert.deepEqual(d.links.map((l) => [l.kind, l.url]), [["live", "https://court-rise-web.vercel.app/"]]);
});

test("claims stay inside what the projects' files show", () => {
  // The POS API has no login route, so no authentication is claimed; the README's database is not asserted as built.
  assert.match(text("pos-tracking-system"), /Authentication is not wired into the API yet/);
  assert.doesNotMatch(JSON.stringify(curatedContent.find((c) => c.projectId === "pos-tracking-system")!.features), /login|authentication|JWT/i);
  // The face project contains no photos and claims no accuracy.
  assert.match(text("parsing-face-color"), /does not contain photos/);
  assert.match(text("parsing-face-color"), /No accuracy results are claimed/);
  // The Android port's parity with iOS is not claimed.
  assert.match(text("chickenflip"), /feature parity was not independently verified/);
  // The web portal is a prototype, and the working name is disclosed.
  assert.match(text("bugunluk-web"), /earlier working name, JobLink/);
  for (const id of ids) assert.doesNotMatch(text(id), /\b(million|best-selling|award|top-rated|#1)\b/i);
});

test("private repositories are never named in the added projects", () => {
  for (const id of ids) assert.doesNotMatch(text(id), /github\.com\/bertantasman|fastReading|ChickenFlick|takipSistemi|buGunlukWeb/);
});

test("the skills now include the technologies the projects use, and the featured skills are listed skills", () => {
  const all = profile.skillGroups.flatMap((g) => g.skills);
  for (const s of ["Kotlin", "Jetpack Compose", "SpriteKit", "StoreKit 2", "libGDX", "TypeScript", "Next.js", "Firebase"]) assert.ok(all.includes(s), `${s} is missing`);
  for (const s of profile.featuredSkills ?? []) assert.ok(all.includes(s), `${s} is featured but not listed`);
});
