import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { profile } from "@/data/profile";
import { parseProfileDate } from "@/lib/profile/format";
import { getCareerTimeline, getFeaturedSkills, getFullBio, getShortBio } from "@/lib/profile/selectors";
import { validateProfile } from "@/lib/profile/validate";
import { safeMailto } from "@/lib/safe-url";

const words = (s: string) => s.trim().split(/\s+/).length;

test("the profile passes validation", () => {
  assert.deepEqual(validateProfile(profile), []);
});

test("Who Am I and the short summary are first-person, concrete, and the right length", () => {
  const bio = getFullBio();
  const n = bio.reduce((sum, p) => sum + words(p), 0);
  assert.ok(n >= 100 && n <= 150, `Who Am I is ${n} words`);
  const short = getShortBio()!;
  assert.ok(words(short) >= 35 && words(short) <= 60, `summary is ${words(short)} words`);
  assert.match(bio[0], /^I['’]m /);
  for (const text of [...bio, short]) assert.doesNotMatch(text, /\b(passionate|highly motivated|cutting-edge|innovative|guru|expert)\b/i);
});

test("the title is supported by a position in the profile", () => {
  assert.ok(profile.experience.some((e) => e.role.includes(profile.headline!)), "the headline must come from a real role");
});

test("education and experience have consistent, ordered dates", () => {
  for (const e of [...profile.education, ...profile.experience]) {
    const start = parseProfileDate(e.startDate);
    const end = parseProfileDate("graduationDate" in e ? e.graduationDate : (e as { endDate?: string }).endDate);
    assert.ok(start, `${e.id} needs a start date`);
    if (end) assert.ok(end.sort >= start.sort, `${e.id} ends before it starts`);
    if (e.current) assert.equal(end, undefined, `${e.id} is current but has an end date`);
  }
});

test("the timeline derived for Notes is chronological and invents nothing", () => {
  const t = getCareerTimeline();
  const dates = t.map((m) => parseProfileDate(m.date)!.sort);
  assert.deepEqual(dates, [...dates].sort((a, b) => a - b));
  const recorded = new Set([...profile.education.flatMap((e) => [e.startDate, e.graduationDate]), ...profile.experience.flatMap((e) => [e.startDate, e.endDate])].filter(Boolean));
  for (const m of t) assert.ok(recorded.has(m.date), `${m.title} is not tied to a recorded date`);
});

test("skills: no invented proficiency, and featured skills are listed skills", () => {
  const all = profile.skillGroups.flatMap((g) => g.skills);
  assert.equal(new Set(all.map((s) => s.toLowerCase())).size, all.length, "a skill is listed twice");
  const withLevel = all.filter((s) => /\((expert|advanced|intermediate|beginner|basic|\d+%?)\)/i.test(s) || /\b(expert|advanced|beginner)\b/i.test(s));
  assert.deepEqual(withLevel, ["SwiftUI (intermediate)"], "only the level the CV itself states may appear");
  assert.deepEqual(getFeaturedSkills(), profile.featuredSkills, "every featured skill is a listed skill");
});

test("spoken languages keep exactly the levels the CV states", () => {
  assert.deepEqual(profile.languages.map((l) => [l.language, l.proficiency]), [["Turkish", "Native"], ["English", "B2 (independent user)"]]);
});

test("contact: a valid email, no phone or address in the profile", () => {
  assert.ok(safeMailto(profile.email));
  const json = JSON.stringify(profile);
  assert.doesNotMatch(json, /\+\d{2}\s?\d{6,}|\(\+\d{2}\)/, "a phone number is in the profile");
  assert.doesNotMatch(json, /Via\s+[A-Z]|Date of birth|Place of birth|Nationality/i);
});

// ── Privacy: nothing from the private CV may ship ───────────────────────────────────────────

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "tests", "scratch"].includes(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

test("the only PDF in the project is the generated, privacy-trimmed résumé; the original CV is not here", () => {
  const pdfs = walk(path.resolve(process.cwd())).filter((f) => f.toLowerCase().endsWith(".pdf")).map((f) => path.relative(process.cwd(), f));
  assert.deepEqual(pdfs, [path.join("public", "documents", "Resume.pdf")], "an unexpected PDF is inside the repository (the original CV must stay private)");
});

test("no phone number, birth details or street address appears in source, public assets or docs", () => {
  const roots = ["src", "public", "docs", "scripts"].map((d) => path.resolve(process.cwd(), d));
  const patterns: [string, RegExp][] = [
    ["phone number", /\+\d{2}[\s-]?\d{9,11}\b|\(\+\d{2}\)\s?\d{6,}/],
    ["birth details", /Date of birth|Place of birth|\b\d{2}\/\d{2}\/(19|20)\d{2}\b.{0,20}birth/i],
    ["street address", /\bVia\s+[A-Z][\w'’]+(\s+[A-Z][\w'’]+)?\s+\d{1,3}\b/],
  ];
  for (const root of roots) {
    let files: string[] = [];
    try { files = walk(root); } catch { continue; }
    for (const f of files.filter((x) => /\.(tsx?|json|md|mjs|txt|html|css|svg)$/i.test(x))) {
      const text = readFileSync(f, "utf8");
      for (const [label, re] of patterns) assert.doesNotMatch(text, re, `${label} found in ${path.relative(process.cwd(), f)}`);
    }
  }
});

test("every profile document in the file system prints its own text with `cat`, and unknown ids print nothing", async () => {
  const { profileFileLines } = await import("@/lib/profile/text");
  for (const e of profile.experience) assert.ok(profileFileLines(`experience:${e.id}`)?.[0].includes(e.organization), e.id);
  for (const e of profile.education) assert.ok(profileFileLines(`education:${e.id}`)?.[0].includes(e.institution), e.id);
  for (const g of profile.skillGroups) assert.ok(profileFileLines(`skills:${g.id}`)?.join(" ").includes(g.skills[0]), g.id);
  assert.equal(profileFileLines("experience:nope"), undefined);
  assert.equal(profileFileLines("documents"), undefined);
});

test("the invisible SEO summary contains nothing focusable (no links, buttons or tab stops)", () => {
  const source = readFileSync(path.resolve(process.cwd(), "src/components/seo/portfolio-summary.tsx"), "utf8");
  // Strip comments, then check the markup it renders.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  for (const forbidden of [/<a[\s>]/, /<button[\s>]/, /<input[\s>]/, /<select[\s>]/, /tabIndex/, /href=/]) assert.doesNotMatch(code, forbidden, `the summary must not contain ${forbidden}`);
});
