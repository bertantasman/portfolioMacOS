import assert from "node:assert/strict";
import { test } from "node:test";
import { notes } from "@/data/notes";
import { profile } from "@/data/profile";
import { curatedContent } from "@/data/project-content/curated";
import { getNoteDocuments } from "@/features/notes/lib/content";
import { getProjectDetail } from "@/features/project-viewer/utils/project-detail";
import { ABOUT_SECTION_LABELS, getFullBio, isAboutSection } from "@/lib/profile/selectors";
import { validateProfile } from "@/lib/profile/validate";
import { deriveRegistry } from "@/lib/projects/registry";

const words = (s: string) => s.trim().split(/\s+/).length;
const personal = () => [...(profile.story ?? []), ...(profile.drives ?? []), ...(profile.beyondTheCode ?? []), ...(profile.whatsNext ?? [])];
const bugunluk = () => deriveRegistry([]).byId.get("bugunluk")!;

// The text the developer approved, verbatim, split only into display paragraphs. Guards against accidental edits.
const approved = {
  story:
    "My interest in technology started long before I wrote my first line of code. Growing up, I was always curious about computers and how things worked behind the screen. Over time, that curiosity evolved into software development. Being surrounded by people who were building successful mobile applications inspired me to explore mobile development myself. As smartphones became a bigger part of my everyday life, I became increasingly interested in creating experiences for the devices we use most. Today, mobile development is where I feel most at home, particularly iOS development. What interests me most isn't just making an application work. It's making it feel right to the person using it. I believe a great mobile application should be intuitive, thoughtfully designed, and enjoyable to use. I'm especially interested in opportunities where I can combine technical development with product thinking and user experience.",
  drives:
    "For me, software development is about more than writing code. I'm interested in the entire experience of building a product, from understanding the problem to figuring out how people will interact with the final application. User experience is especially important to me. I believe that even a technically impressive application can fall short if it feels confusing or difficult to use. That's why I enjoy thinking about how an application looks, behaves, and feels from the user's perspective. My goal is to build mobile experiences that are not only functional but also intuitive and enjoyable.",
  beyond:
    "When I'm not working on software, you'll probably find me listening to music, watching basketball, or looking forward to the next concert or sporting event. Music is a big part of my everyday life, and I particularly enjoy experiencing it live. The same goes for sports: there's something about the atmosphere of a live game that you simply can't recreate through a screen. I enjoy experiences that bring people together, whether that's a concert, a basketball game, or working with a small team to bring an idea to life.",
  next:
    "I'm looking forward to continuing my career in software development, with a particular focus on mobile applications. iOS development is where I have the strongest experience, and it's an area I'd love to keep exploring professionally. At the same time, I enjoy learning new technologies and remain open to opportunities that allow me to grow as a software engineer. I'm especially interested in working on products where technical development and thoughtful user experience come together. I'm available for new opportunities now.",
  project:
    "BuGunluk is more than another project in my portfolio. It's something a close friend and I started together, shaped through countless conversations, and gradually turned into a real application with our team. Although it hasn't been publicly released yet, it's the project I feel most personally connected to. We've invested so much time and care into it that it feels like something we've grown together from the very beginning.",
};

test("the personal sections contain exactly the approved text", () => {
  assert.equal(profile.story?.join(" "), approved.story);
  assert.equal(profile.drives?.join(" "), approved.drives);
  assert.equal(profile.beyondTheCode?.join(" "), approved.beyond);
  assert.equal(profile.whatsNext?.join(" "), approved.next);
  assert.equal(bugunluk().content?.personalStory?.paragraphs.join(" "), approved.project);
});

test("paragraphs are short enough to read comfortably, and none is repeated anywhere on the About page", () => {
  const all = [...personal(), ...getFullBio(), ...(bugunluk().content?.personalStory?.paragraphs ?? [])];
  for (const p of all) assert.ok(p.trim() && words(p) <= 75, `a paragraph is ${words(p)} words: "${p.slice(0, 40)}…"`);
  assert.equal(new Set(all).size, all.length, "a paragraph appears in more than one place");
});

test("the personal story contains no invented specifics: no dates, figures, names or availability dates", () => {
  const text = personal().join(" ");
  assert.doesNotMatch(text, /\b(19|20)\d{2}\b/, "an unverified year appears");
  assert.doesNotMatch(text, /\d/, "an unverified figure appears");
  assert.doesNotMatch(text, /\b(favou?rite|NBA|Spotify|festival|Lakers|Warriors)\b/i, "an invented artist, team or event appears");
  assert.doesNotMatch((profile.whatsNext ?? []).join(" "), /\b(offer|hired|available from|start date|years of experience|expert|notice)\b|\bavailable (on|from|starting|in)\b/i, "What's Next implies an offer, a date or expertise");
  assert.doesNotMatch((profile.whatsNext ?? []).join(" "), /\b(Kotlin|Flutter|React|Swift\b)/, "What's Next names technology beyond what the CV supports");
});

test("BuGunluk's story states it is unreleased and a team effort, and invents nothing", () => {
  const story = bugunluk().content!.personalStory!;
  const text = story.paragraphs.join(" ");
  assert.match(text, /hasn't been publicly released/);
  assert.match(text, /with our team/);
  assert.doesNotMatch(text, /\d/, "no figures");
  assert.doesNotMatch(text, /\b(revenue|downloads?|installs?|customers?|launched|launch date|App Store|Google Play|users)\b/i);
  // No sole-ownership claim.
  assert.doesNotMatch(text, /\bI (built|developed|created|designed|wrote|led|founded)\b/i);
  assert.ok(bugunluk().content!.outcomes?.some((o) => /not yet released/i.test(o.label) && /team of four/.test(o.description ?? "")));
  assert.ok((story.previewParagraphs ?? []).every((i) => story.paragraphs[i] !== undefined), "preview points at real paragraphs");
});

test("BuGunluk keeps its verified factual description and its id; no other project has a personal story", () => {
  const p = bugunluk();
  assert.equal(p.id, "bugunluk");
  assert.match(p.shortDescription, /flexible, short-term job opportunities/);
  assert.equal(curatedContent.filter((c) => c.personalStory).map((c) => c.projectId).join(), "bugunluk");
  assert.equal(profile.closeProjectId, "bugunluk");
  assert.deepEqual(validateProfile(profile, new Set(deriveRegistry([]).all.map((x) => x.id))), []);
});

test("only the project with personal context shows the story in the Project Viewer's model", () => {
  const registry = deriveRegistry([]);
  assert.equal(getProjectDetail(registry.byId.get("bugunluk")!).personalStory?.title, "What BuGunluk Means to Me");
  assert.equal(getProjectDetail(registry.byId.get("macos-portfolio")!).personalStory, undefined);
  assert.equal(getProjectDetail(registry.byId.get("geoattend")!).personalStory, undefined);
});

test("validation reports a close-project reference that does not exist, and an empty or repeated paragraph", () => {
  const known = new Set(["bugunluk"]);
  assert.match(validateProfile({ ...profile, closeProjectId: "nope" }, known).map((i) => i.message).join(), /Unknown project "nope"/);
  assert.match(validateProfile({ ...profile, story: ["a", "a"] }, known).map((i) => i.message).join(), /repeated paragraph/);
  assert.match(validateProfile({ ...profile, whatsNext: [" "] }, known).map((i) => i.message).join(), /empty paragraph/);
});

test("the About page's section ids and labels are registered", () => {
  for (const id of ["story", "drives", "closeProject", "beyond", "next"]) assert.ok(isAboutSection(id) && ABOUT_SECTION_LABELS[id as keyof typeof ABOUT_SECTION_LABELS]);
  assert.equal(ABOUT_SECTION_LABELS.next, "What's Next");
});

test("Notes reuses the same text: philosophy, journey and About Me carry it, with no new notes", () => {
  const docs = new Map(getNoteDocuments().map((d) => [d.note.id, d]));
  assert.ok(docs.get("development-philosophy")?.haystack.includes("user experience is especially important to me"));
  assert.ok(docs.get("development-journey")?.haystack.includes("my interest in technology started"));
  const about = docs.get("about-me")!.haystack;
  assert.ok(about.includes("beyond the code") && about.includes("listening to music") && about.includes("what's next"));
  assert.equal(notes.length, 10, "no note was added");
});
