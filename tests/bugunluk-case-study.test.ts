import assert from "node:assert/strict";
import test from "node:test";
import { curatedContent } from "@/data/project-content/curated";
import { deriveRegistry } from "@/lib/projects/registry";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";

const registry = deriveRegistry([]);
const project = () => registry.byId.get("bugunluk")!;
const study = () => project().content!.caseStudy!;
const allText = () => JSON.stringify(project().content);

test("BuGunluk has one record, extended in place, with the agreed short description everywhere", () => {
  assert.equal(registry.all.filter((p) => p.title === "BuGunluk").length, 1);
  assert.equal(curatedContent.filter((c) => c.projectId === "bugunluk").length, 1);
  const p = project();
  assert.match(p.shortDescription, /^BuGunluk is a native iOS platform connecting students and young workers/);
  assert.equal(p.shortDescription, p.tagline);
  assert.deepEqual([...p.categories], ["ios-development"]);
  assert.equal(p.status, "in-development");
});

test("the technology list is the verified one and nothing more", () => {
  const names = project().content!.technologies!.map((t) => t.name);
  assert.deepEqual(names, ["Swift", "SwiftUI", "MVVM", "Repository Pattern", "Firebase Authentication", "Google Sign-In", "Cloud Firestore", "Firebase Cloud Messaging", "Cloud Functions"]);
});

test("the Project Viewer model carries every case-study part", () => {
  const d = getProjectDetail(project());
  assert.ok(d.problem.length && d.solution.length && d.overview.length);
  const cs = d.caseStudy!;
  assert.equal(cs.audiences?.length, 2);
  assert.equal(cs.journeys?.length, 2);
  assert.equal(cs.journeys![0].items.length, 8);
  assert.equal(cs.journeys![1].items.length, 8);
  assert.equal(cs.highlights?.length, 6);
  assert.deepEqual(cs.currentStatus?.badges, ["Active Development", "Not Yet Publicly Released"]);
  assert.equal(d.personalStory?.title, "What BuGunluk Means to Me");
  assert.equal(getProjectDetail(registry.byId.get("macos-portfolio")!).caseStudy, undefined);
});

test("the developer's account is kept verbatim: origin, role, ownership, team, challenge, reflection", () => {
  const cs = study();
  assert.equal(cs.origin!.title, "How It Started");
  const origin = cs.origin!.paragraphs.join(" ");
  assert.match(origin, /a close friend and I came up with together/);
  assert.match(origin, /more than 30 meetings, sometimes involving a friend who is a lawyer/);
  assert.match(origin, /expanded to include an Android developer and a project manager/);
  assert.equal(cs.role!.title, "My Role");
  const role = cs.role!.paragraphs.join(" ");
  assert.match(role, /As a co-creator of BuGunluk, I took responsibility for developing the native iOS application and its Firebase backend/);
  assert.match(role, /worked closely with my co-creator on product decisions, UI\/UX design/);
  assert.equal(cs.role!.ownership!.items.length, 6);
  assert.equal(cs.challenge!.title, "The Biggest Challenge Wasn't the Code");
  assert.equal(cs.reflection!.title, "What BuGunluk Taught Me");
  assert.deepEqual(cs.collaboration!.stages.map((x) => x.label), ["The beginning", "Product development", "Team expansion", "Collaboration"]);
});

test("the summary at the top states role, team, platform, technologies, status and start", () => {
  const rows = Object.fromEntries(study().summary!.map((r) => [r.label, r.value]));
  assert.deepEqual(rows, {
    Role: "Co-Creator & iOS / Firebase Developer",
    Team: "4 people",
    Platform: "iOS",
    Technologies: "Swift, SwiftUI, Firebase, Firestore",
    Status: "In Development",
    Started: "November 2025",
  });
});

test("the role never overreaches: no executive title, no Android work, no sole ownership", () => {
  const text = allText();
  assert.doesNotMatch(text, /\b(CEO|CTO|sole founder|solo (project|developer)|single-handedly)\b/i);
  assert.doesNotMatch(text, /I (built|developed|wrote|created) the Android/i);
  assert.match(JSON.stringify(study().role), /iOS application and its Firebase backend/);
});

test("the legal story is never presented as resolved, cleared or approved", () => {
  const legal = [study().origin, study().challenge, study().collaboration].map((x) => JSON.stringify(x)).join(" ");
  assert.doesNotMatch(allText(), /legal(ly)? (compliance|compliant|clearance|ready|approved|approval)|regulator|incorporat|registered company|agreements? (were|are) (signed|finali[sz]ed)|ready to launch/i);
  assert.match(legal, /lawyer/);
  assert.doesNotMatch(legal, /resolved|cleared|compliant/i);
});

test("the emotional paragraph appears once, and the story text is not repeated across sections", () => {
  const all = [study().origin, study().role, study().challenge, study().reflection, project().content!.personalStory].flatMap((x) => x!.paragraphs);
  assert.equal(new Set(all).size, all.length);
  assert.equal(all.filter((p) => /more than another project in my portfolio/.test(p)).length, 1);
  assert.equal(project().content!.personalStory!.title, "What BuGunluk Means to Me");
});

test("claims stay inside what the source supports", () => {
  const text = allText();
  // No launch, adoption, revenue or store claims.
  assert.doesNotMatch(text, /App Store|\bdownloads?\b|\bratings?\b|revenue|launched on|\d+\s*(users|downloads)|production-ready|scalab/i);
  // Payment tracking is status tracking, never money movement or a gateway.
  const pay = study().highlights!.find((h) => /Payment/.test(h.title))!;
  assert.match(pay.body, /does not process payments or transfer money/);
  // Job listings are not claimed to be live; messaging and payouts are.
  const rt = study().highlights!.find((h) => /Real-time/.test(h.title))!;
  assert.match(rt.verification!, /Job listings are loaded on request/);
  // Notification functions are described as existing in code, not as operational.
  const push = study().highlights!.find((h) => /notification/i.test(h.title))!;
  assert.match(push.verification!, /not verified/);
  // Nothing private: no config, keys, links to the private repository.
  assert.doesNotMatch(text, /GoogleService|AIza|github\.com\/bertantasman\/buGunluk|apiKey/i);
  assert.equal(project().content!.links, undefined);
});

test("what's next lists only unfinished work", () => {
  const next = study().currentStatus!.next!.items.join(" ");
  assert.doesNotMatch(next, /location-based search|push notification support|messaging/i);
  assert.match(next, /nearby-jobs filter and sorting already exist/);
});
