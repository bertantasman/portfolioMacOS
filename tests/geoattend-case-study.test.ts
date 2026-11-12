import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";

const registry = deriveRegistry([]);
const project = () => registry.byId.get("geoattend")!;
const sections = () => project().content!.caseStudy!.sections!;
const section = (id: string) => sections().find((s) => s.id === id)!;
const allText = () => JSON.stringify(project().content) + JSON.stringify(project());

// The protected terms are assembled from fragments so this file never contains them as plain text.
const protectedTerms = [new RegExp("ye" + "ni[\\s_-]*pa" + "rti", "i"), new RegExp("\\bp" + "olitical\\b", "i"), new RegExp("\\bp" + "olitic", "i"), /join[\s_-]?code|invite[\s_-]?code/i];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

test("public identity: one GeoAttend record, neutral names, category and status", () => {
  assert.equal(registry.all.filter((p) => /geoattend|attendance/i.test(p.title)).length, 1);
  assert.equal(curatedContent.filter((c) => c.projectId === "geoattend").length, 1);
  assert.equal(registry.byId.get("location-based-attendance"), undefined, "the old id is gone");
  const p = project();
  assert.equal(p.title, "GeoAttend");
  assert.equal(p.slug, "geoattend");
  assert.match(p.shortDescription, /^An independently developed native iOS and Android system for event management/);
  const d = getProjectDetail(p);
  assert.ok(d.categoryNames.includes("Institutional Mobile Application"));
  assert.equal(d.status?.label, "In Development");
  assert.equal(d.links.length, 0, "no repository or store link is published");
});

test("no identifying term appears in the portfolio's source, docs, tests, public assets or file names", () => {
  const files = [...walk("src"), ...walk("docs"), ...walk("public"), ...walk("scripts"), ...walk("tests"), "README.md", "package.json"].filter((f) => !f.endsWith("geoattend-case-study.test.ts"));
  for (const f of files) {
    for (const term of protectedTerms) {
      assert.doesNotMatch(f, term, "a file name contains a protected term");
      if (/\.(png|jpe?g|webp|ico|icns|svg|woff2?|pdf)$/i.test(f)) continue;
      assert.doesNotMatch(readFileSync(f, "utf8"), term, `${f} contains a protected term`);
    }
  }
});

test("ownership is solo and stated verbatim; no collaborators or employment are invented", () => {
  assert.equal(project().content!.caseStudy!.summary![0].value, "Solo Full-Stack Mobile Developer");
  assert.equal(section("role").paragraphs![0], "GeoAttend is a cross-platform mobile application that I developed independently.");
  const text = allText();
  assert.doesNotMatch(text, /\b(team of|our team|we built|co-?founder|co-creator|colleague|contractor|employment|customer)\b/i);
  assert.doesNotMatch(text, /commercial/i);
});

test("the architecture lists exactly the confirmed technologies per component", () => {
  const items = Object.fromEntries(section("architecture").items!.map((i) => [i.label, i.value]));
  assert.match(items["Native iOS application"]!, /SwiftUI.*foreground location access, App Check/);
  assert.match(items["Native Android application"]!, /Kotlin, Jetpack Compose, Material 3.*Google Maps, Places SDK, Google Play Services Location/);
  assert.match(items["Shared backend"]!, /callable Cloud Functions.*Firestore security rules, transactional attendance records/);
  assert.match(JSON.stringify(section("architecture").paragraphs), /do not have identical feature sets/);
});

test("the trust boundary is on the server and nothing is called fraud-proof", () => {
  const v = JSON.stringify(section("verification"));
  assert.match(v, /backend validates attendance rather than trusting a client-side location decision/);
  assert.match(v, /Haversine/);
  assert.match(v, /does not make the system fraud-proof/);
  assert.doesNotMatch(v.replace(/does not make the system fraud-proof/, ""), /fraud-proof|tamper-proof|cannot be (faked|spoofed)/i);
});

test("the backend migration is planned, never done, and no new stack is named or claimed", () => {
  const e = section("evolution");
  assert.deepEqual(e.badges, ["Planned, not completed"]);
  assert.match(JSON.stringify(e.paragraphs), /The migration is planned and has not yet been completed\./);
  assert.match(JSON.stringify(project().content!.caseStudy!.summary), /Firebase \(currently\)/);
  assert.doesNotMatch(allText(), /PostgreSQL|MySQL|MongoDB|Supabase|Node\.js|NestJS|Spring|\.NET|REST API/i);
});

test("no release, adoption or production claim", () => {
  assert.doesNotMatch(allText(), /App Store|Google Play(?! Services)|download|production-ready|in production|launched|deployed to|\d+\s*(users|members|events)/i);
});
