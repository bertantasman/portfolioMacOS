import assert from "node:assert/strict";
import test from "node:test";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";

const registry = deriveRegistry([]);
const project = () => registry.byId.get("linemaster")!;
const sections = () => project().content!.caseStudy!.sections!;
const section = (id: string) => sections().find((s) => s.id === id)!;
const allText = () => JSON.stringify(project().content) + JSON.stringify(project());

test("LineMaster has one record, a prototype status, and no repository or store link", () => {
  assert.equal(registry.all.filter((p) => /linemaster/i.test(p.title)).length, 1);
  assert.equal(curatedContent.filter((c) => c.projectId === "linemaster").length, 1);
  const d = getProjectDetail(project());
  assert.equal(d.status?.label, "Playable Prototype");
  assert.equal(d.links.length, 0, "the repository is private, so no link is published");
  assert.ok(d.categoryNames.includes("Game Development"));
  assert.match(project().shortDescription, /^An independently developed mobile arcade game featuring physics-based swinging/);
});

test("ownership is solo, verbatim and not team-developed", () => {
  assert.equal(project().content!.caseStudy!.summary![0].value, "Solo Game Developer & Creator");
  assert.equal(section("role").paragraphs![0], "LineMaster is a game I developed entirely on my own.");
  assert.doesNotMatch(allText(), /\b(team of|our team|we built|co-?founder|collaborat|contractor)\b/i);
});

test("release status: no store, downloads, revenue, reviews or release date", () => {
  const text = allText().replaceAll("no advertising revenue is claimed", "");
  assert.doesNotMatch(text, /App Store|Google Play|download|revenue|reviews?\b|released on|available now|\d+\s*(players|users)/i);
  assert.match(JSON.stringify(section("status")), /has not been released publicly/);
  assert.match(JSON.stringify(section("customization")), /placeholder/);
  assert.match(JSON.stringify(section("progression")), /no cloud synchronization and no multiplayer/);
  assert.match(JSON.stringify(section("daily")), /not synchronized with a server/);
});

test("documented mechanics match the verified numbers", () => {
  assert.match(JSON.stringify(section("daynight")), /1,500 meters/);
  assert.match(JSON.stringify(section("combo")), /30°–37°.*1\.5×.*3\.0×/);
  assert.match(JSON.stringify(section("bonus")), /500 meters/);
  assert.match(JSON.stringify(section("swing")), /atan2/);
  assert.equal(section("powerups").items!.length, 5);
  assert.equal(section("anchors").items!.length, 3);
  assert.deepEqual(section("themes").items!.map((i) => i.label), ["City", "Neon", "Night", "Futuristic"]);
  assert.match(JSON.stringify(section("audio")), /11 synthesized sound effects/);
});

test("the visuals claim stays honest: most, not all, and nothing about Android rendering", () => {
  const v = JSON.stringify(section("visuals"));
  assert.match(v, /most of the visual presentation/);
  assert.match(v, /PNG images/);
  assert.doesNotMatch(v, /no (external )?(image )?assets? (at all|whatsoever)|entirely procedural/i);
  assert.match(v, /No claim is made about how the Android version renders/);
});

test("Android is limited to what its build files show, with no parity claim", () => {
  const a = JSON.stringify(section("android"));
  assert.match(a, /Kotlin and the libGDX/);
  assert.match(a, /No claim of feature parity/);
  assert.doesNotMatch(allText(), /github\.com|AdMob|Unity|Flutter|React Native|Jetpack Compose/);
  assert.match(JSON.stringify(section("architecture").note), /not claimed to be identical/);
});

test("the physics claims stay modest: not a perfect simulation, no benchmarks, no machine learning", () => {
  assert.match(section("swing").note!, /not a physically perfect simulation/);
  assert.match(section("city").note!, /does not use machine learning/);
  assert.doesNotMatch(allText(), /\b\d+\s?(fps|ms)\b|60 ?fps|frames per second/i);
});
