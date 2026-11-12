import assert from "node:assert/strict";
import { test } from "node:test";
import { MOBILE_MAX_WIDTH, shellModeFor } from "@/lib/shell-mode";
import { MAX_RECENTS, back, close, depthOf, formatHash, goHome, initialNav, launch, parseHash, push } from "@/features/mobile/lib/router";

test("the shell breakpoint: 767px and below is mobile, 768px and above is desktop", () => {
  for (const w of [320, 375, 390, 430, 767]) assert.equal(shellModeFor(w), "mobile", String(w));
  for (const w of [768, 1024, 1440]) assert.equal(shellModeFor(w), "desktop", String(w));
  assert.equal(MOBILE_MAX_WIDTH, 767);
});

test("launch → push → back → home keeps each app's screens and the recents order", () => {
  let s = launch(initialNav, "projects");
  s = push(s, "courtrise");
  assert.deepEqual(s.stacks.projects, ["courtrise"]);
  assert.equal(depthOf(s), 2);
  s = back(s);
  assert.equal(s.active, "projects");
  assert.equal(depthOf(s), 1);
  s = back(s);
  assert.equal(s.active, null);
  s = launch(goHome(launch(s, "about")), "projects");
  assert.deepEqual(s.recents, ["projects", "about"]);
});

test("reopening an app resumes its screens; a deep link replaces them", () => {
  let s = push(launch(initialNav, "projects"), "linemaster");
  s = goHome(s);
  assert.deepEqual(launch(s, "projects").stacks.projects, ["linemaster"]);
  assert.deepEqual(launch(s, "projects", ["courtrise"]).stacks.projects, ["courtrise"]);
});

test("pushing the same screen twice does nothing; pushing on the home screen does nothing", () => {
  const s = push(launch(initialNav, "files"), "a");
  assert.equal(push(s, "a"), s);
  assert.equal(push(initialNav, "a"), initialNav);
});

test("the recents list is capped and closing an app forgets it", () => {
  let s = initialNav;
  for (let i = 0; i < 20; i++) s = launch(s, `app${i}`);
  assert.equal(s.recents.length, MAX_RECENTS);
  assert.equal(s.recents[0], "app19");
  s = close(push(s, "x"), "app19");
  assert.equal(s.active, null);
  assert.ok(!s.recents.includes("app19"));
  assert.equal(s.stacks.app19, undefined);
});

test("deep links round-trip, reject unknown apps and survive odd characters", () => {
  const known = (id: string) => ["projects", "resume"].includes(id);
  assert.equal(formatHash("projects", ["github:123"]), "#/projects/github%3A123");
  assert.deepEqual(parseHash("#/projects/github%3A123", known), { app: "projects", stack: ["github:123"] });
  assert.deepEqual(parseHash("#/resume", known), { app: "resume", stack: [] });
  assert.equal(parseHash("#/nope", known), null);
  assert.equal(parseHash("#/projects/%E0%A4%A", known), null);
  assert.equal(parseHash("", known), null);
  assert.equal(formatHash(null, []), "");
});

import { getExternalApps, isMobileAppId, mobileApps, DOCK_APPS, HOME_APPS } from "@/features/mobile/lib/apps";
import { buildNotices } from "@/features/mobile/lib/notices";
import { highlightParts, routeForTarget } from "@/features/mobile/lib/targets";
import { getRegistry } from "@/lib/projects/registry";

test("every mobile app is unique, and the Dock and home page only use real apps without repeats", () => {
  const ids = mobileApps.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of [...DOCK_APPS, ...HOME_APPS]) assert.ok(isMobileAppId(id), id);
  assert.equal(new Set([...DOCK_APPS, ...HOME_APPS]).size, DOCK_APPS.length + HOME_APPS.length);
  for (const a of mobileApps) assert.ok(a.icon.startsWith("/icons/apps/"));
});

test("search targets map to mobile apps: projects, resume, notes, external profiles; unknown things map to nothing", () => {
  const project = getRegistry().projects[0];
  assert.deepEqual(routeForTarget({ kind: "project", projectId: project.id }), { kind: "app", app: "projects", stack: [project.id] });
  assert.deepEqual(routeForTarget({ kind: "file", fileId: "resume" }), { kind: "app", app: "resume", stack: [] });
  assert.deepEqual(routeForTarget({ kind: "note", noteId: "about-me" }), { kind: "app", app: "notes", stack: ["about-me"] });
  assert.deepEqual(routeForTarget({ kind: "application", appId: "mail" }), { kind: "app", app: "contact", stack: [] });
  assert.equal(routeForTarget({ kind: "application", appId: "launchpad" }), null);
  assert.equal(routeForTarget({ kind: "file", fileId: "does-not-exist" }), null);
  for (const e of getExternalApps()) assert.deepEqual(routeForTarget({ kind: "application", appId: e.id }), { kind: "external", url: e.url });
});

test("highlighting splits text without ever producing markup", () => {
  assert.deepEqual(highlightParts("CourtRise", "rise"), [{ text: "Court", match: false }, { text: "Rise", match: true }]);
  assert.deepEqual(highlightParts("<b>x</b>", "b"), [{ text: "<", match: false }, { text: "b", match: true }, { text: ">x</", match: false }, { text: "b", match: true }, { text: ">", match: false }]);
  assert.deepEqual(highlightParts("abc", " "), [{ text: "abc", match: false }]);
});

test("notices come from the portfolio's own content and open real destinations", () => {
  const notices = buildNotices(getRegistry());
  assert.ok(notices.length >= 2);
  assert.equal(new Set(notices.map((n) => n.id)).size, notices.length);
  for (const n of notices) {
    assert.ok(isMobileAppId(n.app));
    if (n.stack?.[0]) assert.ok(getRegistry().byId.get(n.stack[0]), n.id);
  }
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const mobileFiles = [...walk(path.join(process.cwd(), "src/features/mobile")), ...walk(path.join(process.cwd(), "src/components/shell"))];

test("the mobile shell never uses the desktop window manager, and the desktop code is not imported by it", () => {
  for (const f of mobileFiles) {
    const text = readFileSync(f, "utf8");
    assert.ok(!/store\/window-store|window-chrome|WindowDragArea/.test(text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")) || f.endsWith("desktop-shell.tsx"), `${path.relative(process.cwd(), f)} touches the window manager`);
  }
});

test("only the desktop shell mounts the desktop's startup, onboarding and shortcuts", () => {
  for (const f of mobileFiles.filter((f) => !f.endsWith("desktop-shell.tsx"))) {
    const text = readFileSync(f, "utf8");
    assert.ok(!/StartupController|OnboardingController|OverlayShortcuts|AppPreloader/.test(text), path.relative(process.cwd(), f));
  }
});

test("external links in the mobile shell open in a new tab with noopener noreferrer", () => {
  for (const f of mobileFiles.filter((f) => f.endsWith(".tsx"))) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.ok(/noopener noreferrer/.test(m[0]), `${path.relative(process.cwd(), f)}: ${m[0].slice(0, 60)}`);
    for (const m of text.matchAll(/window\.open\([^)]*\)/g)) assert.ok(/noopener,noreferrer/.test(m[0]), `${path.relative(process.cwd(), f)}: ${m[0]}`);
  }
});
