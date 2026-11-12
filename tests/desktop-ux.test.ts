import assert from "node:assert/strict";
import { test } from "node:test";
import { applications, getDockSections, launchpadApplications } from "@/config/applications";
import { DESKTOP_PROJECTS_ID, FOLDER, portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { getDesktopItems } from "@/features/desktop-icons/lib/layout";
import { getSearchIndex } from "@/features/spotlight/utils/build-search-index";
import { onboardingSteps } from "@/features/onboarding/data/onboarding-steps";
import { getRegistry } from "@/lib/projects/registry";
import { validateFileSystem } from "@/lib/virtual-fs/validate";

const dock = getDockSections().flat();

test("the Dock is short: 7 pinned items, in two groups", () => {
  assert.equal(dock.length, 7);
  assert.deepEqual(dock.map((a) => a.id), ["finder", "launchpad", "safari", "terminal", "projects", "about-me", "contact"]);
  assert.equal(getDockSections().length, 2);
});

test("the Dock shortcuts lead to real destinations", async () => {
  const { notes } = await import("@/data/notes");
  for (const app of dock.filter((a) => a.shortcut)) {
    const s = app.shortcut!;
    if (s.kind === "folder") assert.equal(fs.getFile(s.folderId)?.type, "folder");
    if (s.kind === "note") assert.ok(notes.some((n) => n.id === s.noteId));
    assert.equal(app.launchable, false); // shortcuts are not apps: no duplicate in Launchpad or Spotlight
  }
  assert.equal(dock.filter((a) => a.shortcut).length, 3);
});

test("apps removed from the Dock stay reachable in Launchpad and Spotlight", () => {
  const removed = applications.filter((a) => a.launchable && !a.inDock && !a.overlay);
  assert.ok(removed.length > 0);
  const index = getSearchIndex();
  for (const app of removed) {
    assert.ok(launchpadApplications.some((a) => a.id === app.id), `${app.id} missing from Launchpad`);
    assert.ok(index.some((i) => i.id === `app:${app.id}`), `${app.id} missing from Spotlight`);
  }
  // Mission Control (an overlay) is still searchable even though it is no longer pinned.
  assert.ok(index.some((i) => i.id === "app:mission-control"));
  // Every pinned app is also launchable.
  assert.ok(dock.filter((a) => !a.shortcut).every((a) => a.launchable));
});

test("the rendered desktop icons are exactly Projects and Resume.pdf (no volume, no project shortcuts)", () => {
  assert.deepEqual(getDesktopItems(null).map((i) => i.name), ["Projects", "Resume.pdf"]);
});

test("the Desktop holds one Projects folder and no individual projects", () => {
  const items = fs.getChildren(FOLDER.desktop);
  assert.deepEqual(items.map((i) => i.name).sort(), ["Projects", "Resume.pdf"]);
  assert.equal(items.filter((i) => i.type === "project").length, 0);
  const projects = fs.getFile(DESKTOP_PROJECTS_ID);
  assert.equal(projects?.type, "folder");
  assert.equal(projects?.aliasOf, FOLDER.projects);
});

test("the Desktop's Projects folder shows the real Projects folder: every curated project once, no copies", () => {
  const viaAlias = fs.getChildren(DESKTOP_PROJECTS_ID);
  assert.deepEqual(viaAlias, fs.getChildren(FOLDER.projects));
  const curated = getRegistry().projects.filter((p) => p.source === "curated");
  const direct = viaAlias.filter((f) => f.type === "project");
  assert.deepEqual(direct.map((f) => f.projectId).sort(), curated.map((p) => p.id).sort());
  assert.equal(new Set(direct.map((f) => f.projectId)).size, direct.length);
  for (const f of direct) assert.ok(fs.resolveProject(f), `${f.name} has no project record`);
  // Folder names never collide with project names.
  assert.equal(new Set(viaAlias.map((f) => f.name.toLowerCase())).size, viaAlias.length);
});

test("Spotlight lists each project exactly once (the alias adds no duplicates)", () => {
  const ids = getSearchIndex().filter((i) => i.type === "project").map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  const titles = getSearchIndex().filter((i) => i.type === "folder").map((i) => i.title);
  assert.equal(titles.filter((t) => t === "Projects").length, 1);
});

test("an alias must point at a real folder, not at a file or another alias", () => {
  const base = [
    { id: "r", name: "r", type: "folder" as const, parentId: null },
    { id: "a", name: "a", type: "folder" as const, parentId: "r" },
    { id: "b", name: "b", type: "folder" as const, parentId: "r", aliasOf: "a" },
  ];
  const opts = { rootId: "r", hasProject: () => true };
  assert.deepEqual(validateFileSystem(base, opts), []);
  assert.equal(validateFileSystem([...base, { id: "c", name: "c", type: "folder" as const, parentId: "r", aliasOf: "b" }], opts).length, 1);
  assert.equal(validateFileSystem([...base, { id: "d", name: "d", type: "folder" as const, parentId: "r", aliasOf: "missing" }], opts).length, 1);
});

test("the tour points at the Projects folder and no step targets a Dock icon that is gone", () => {
  const projects = onboardingSteps.find((s) => s.id === "projects");
  assert.equal(projects?.targetId, "onboarding-projects");
  assert.ok(!onboardingSteps.some((s) => s.targetId === "onboarding-mission-control"));
  assert.ok(onboardingSteps.length <= 8);
});
