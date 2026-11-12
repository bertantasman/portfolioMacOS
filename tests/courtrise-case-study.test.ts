import assert from "node:assert/strict";
import test from "node:test";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";

const registry = deriveRegistry([]);
const project = () => registry.byId.get("courtrise")!;
const sections = () => project().content!.caseStudy!.sections!;
const section = (id: string) => sections().find((s) => s.id === id)!;
const allText = () => JSON.stringify(project().content);

test("CourtRise has one record, an official App Store link and a published status", () => {
  assert.equal(registry.all.filter((p) => /courtrise/i.test(p.title)).length, 1);
  assert.equal(curatedContent.filter((c) => c.projectId === "courtrise").length, 1);
  const d = getProjectDetail(project());
  const store = d.links.find((l) => l.kind === "appStore");
  assert.equal(store?.url, "https://apps.apple.com/tr/app/courtrise/id6760609447");
  assert.equal(store?.label, "View on the App Store");
  assert.equal(d.status?.label, "Published on the App Store");
  assert.deepEqual([...project().categories], ["ios-development"]);
  assert.match(project().shortDescription, /^CourtRise is a published native iOS basketball training application/);
});

test("no repository link is published and no ratings, downloads, subscribers or revenue are claimed", () => {
  assert.equal(project().content!.links?.github, undefined);
  const text = allText();
  assert.doesNotMatch(text, /github\.com|GoogleService|apiKey/i);
  assert.doesNotMatch(text, /\b\d[\d,.]*\s*(downloads|users|subscribers|reviews|ratings)\b|\b(rated|top-rated|best-selling|\d(\.\d)? stars?)\b/i);
  assert.match(section("freemium").note!, /does not prove paying subscribers, revenue or commercial success/);
  assert.doesNotMatch(text, /[$€£]\s?\d|₺\s?\d|\d\s?(TL|USD|EUR)\b/, "no fixed subscription price");
});

test("adaptive difficulty is rule-based, uses the documented weights, and is not called AI", () => {
  const a = section("adaptive");
  const text = JSON.stringify(a);
  assert.match(text, /65% progress within the player's current level band/);
  assert.match(text, /35% progress of the relevant attribute/);
  assert.match(a.note!, /not machine learning or AI/);
  assert.match(a.note!, /not been scientifically validated/);
  assert.match(a.note!, /does not guarantee improved basketball performance/);
  // The older "sharpness" mechanic was replaced in the app's source and is not presented.
  assert.doesNotMatch(allText(), /sharpness/i);
  assert.doesNotMatch(allText().replace(/not machine learning or AI/g, ""), /\b(AI-powered|machine learning model|neural)\b/i);
});

test("the documented systems are all present and accurate", () => {
  assert.equal(section("training").items!.length, 5);
  assert.deepEqual(section("training").bullets, ["Accuracy-based results", "Repetition targets", "Time-based objectives", "Turnover limits"]);
  assert.match(JSON.stringify(section("progression")), /floor of the average of the five attributes/);
  assert.match(JSON.stringify(section("identity")), /300-point initial attribute allocation/);
  assert.deepEqual(section("mascot").bullets, ["Normal", "Happy", "Sad", "Angry", "Tired", "Idea"]);
  assert.deepEqual(section("identity-visual").items!.map((i) => i.value), ["#FF6B00", "#0E0E10", "#1C1C1E"]);
  assert.deepEqual(section("access").bullets, ["Email/password authentication", "Google Sign-In", "Sign in with Apple", "Guest Mode"]);
  assert.equal(section("highlights").bullets!.length, 10);
  assert.match(section("freemium").note!, /No price is shown/);
});

test("the basketball paragraph is the approved text, once, and the user's story stays honest", () => {
  const p = section("meets").paragraphs!;
  assert.equal(p[0], "Basketball has always been one of my interests outside software development.");
  assert.equal(p.length, 5);
  const all = sections().flatMap((s) => s.paragraphs ?? []);
  assert.equal(new Set(all).size, all.length, "no paragraph is repeated");
  assert.doesNotMatch(JSON.stringify(section("meets")), /\b(played|my team|coach|years|competitive|league)\b/i);
});

test("BuGunluk is still present and still featured beside CourtRise", () => {
  assert.ok(registry.byId.get("bugunluk"));
});

test("the developer's role is stated as solo, verbatim, and sits right after the overview", () => {
  assert.equal(sections()[0].id, "role");
  assert.equal(section("role").title, "My Role");
  assert.equal(section("role").paragraphs![0], "CourtRise is a project I built entirely on my own, from the initial idea to its release on the App Store.");
  assert.match(JSON.stringify(section("role")), /StoreKit 2 subscription integration/);
  assert.equal(project().content!.caseStudy!.summary![0].value, "Solo Developer & Product Creator");
});

test("the 30,000 impressions figure is stated once, as organic impressions, never as downloads", () => {
  const aso = section("aso");
  assert.match(JSON.stringify(aso.paragraphs), /ASO\) settings myself/);
  assert.match(JSON.stringify(aso.paragraphs), /Without any paid advertising.*about 30,000 impressions/);
  assert.match(aso.note!, /not a download/);
  assert.equal(project().content!.caseStudy!.summary!.at(-1)!.value, "About 30,000 App Store impressions, no paid advertising");
  assert.doesNotMatch(allText(), /30,?000\s*(downloads|installs|users|subscribers)/i);
});
