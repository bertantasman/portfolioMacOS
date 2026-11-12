import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { existsSync } from "node:fs";
import path from "node:path";
import { documents, isPublished } from "@/data/documents";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { getNoteDocuments } from "@/features/notes/lib/content";
import { getSearchIndex } from "@/features/spotlight/utils/build-search-index";
import { searchItems } from "@/features/spotlight/utils/search-utils";
import { getProjectById } from "@/lib/projects/registry";
import { useRepositoryStore } from "@/store/repository-store";
import { repo } from "./fixtures";

const realFetch = globalThis.fetch;
let requests = 0;
const answer = (body: unknown) => {
  globalThis.fetch = (async () => {
    requests++;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
};
const ok = (repositories: unknown[], extra: Record<string, unknown> = {}) => ({ ok: true, username: "octocat", repositories, fetchedAt: 1, truncated: false, stale: false, ...extra });

beforeEach(() => {
  requests = 0;
  useRepositoryStore.setState({ status: "idle", repositories: [], error: null, stale: false, refreshing: false, truncated: false });
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("concurrent loads make one request and share the list", async () => {
  answer(ok([repo(1, "a")]));
  const s = useRepositoryStore.getState();
  await Promise.all([s.load(), s.load(), s.refresh()]);
  assert.equal(requests, 1);
  assert.equal(useRepositoryStore.getState().repositories.length, 1);
});

test("a failed refresh keeps the repositories on screen and reports the error", async () => {
  answer(ok([repo(1, "a"), repo(2, "b")]));
  await useRepositoryStore.getState().load();
  const before = useRepositoryStore.getState().repositories;
  answer({ ok: false, reason: "rate-limited", message: "Rate limited" });
  await useRepositoryStore.getState().refresh();
  const after = useRepositoryStore.getState();
  assert.equal(after.repositories, before, "same list object, so nothing re-renders");
  assert.equal(after.status, "ready");
  assert.equal(after.stale, true);
  assert.equal(after.error?.reason, "rate-limited");
});

test("a network failure on first load leaves an error and an empty list, not a crash", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("offline");
  }) as typeof fetch;
  await useRepositoryStore.getState().load();
  const s = useRepositoryStore.getState();
  assert.equal(s.status, "error");
  assert.deepEqual(s.repositories, []);
});

test("an identical refresh does not replace the list (no needless re-render)", async () => {
  answer(ok([repo(1, "a")]));
  await useRepositoryStore.getState().load();
  const first = useRepositoryStore.getState().repositories;
  await useRepositoryStore.getState().refresh();
  assert.equal(useRepositoryStore.getState().repositories, first);
});

test("a truncated refresh does not remove repositories that were already known", async () => {
  answer(ok([repo(1, "a"), repo(2, "b")]));
  await useRepositoryStore.getState().load();
  answer(ok([repo(1, "a")], { truncated: true }));
  await useRepositoryStore.getState().refresh();
  assert.deepEqual(useRepositoryStore.getState().repositories.map((r) => r.id).sort(), [1, 2]);
});

test("a new repository reaches the registry, Finder, Spotlight and Notes without a reload", async () => {
  const notesBefore = getNoteDocuments();
  const indexBefore = getSearchIndex();
  assert.equal(getNoteDocuments(), notesBefore, "notes are cached while nothing changes");
  assert.equal(getSearchIndex(), indexBefore, "the search index is cached while nothing changes");

  answer(ok([repo(501, "shiny-new", { topics: ["swiftui"], primaryLanguage: "Swift", description: "A brand new thing" })]));
  await useRepositoryStore.getState().load();

  assert.equal(getProjectById("github:501")?.title, "shiny-new");
  const placement = fs.getFile("project:github:501@ios-development");
  assert.equal(placement?.type, "project");
  assert.equal(fs.resolveProject(placement!)?.id, "github:501");
  assert.ok(getSearchIndex().some((i) => i.id === "project:github:501"));
  assert.ok(searchItems(getSearchIndex(), "shiny").flatMap((g) => g.items).some((i) => i.id === "project:github:501"));
  assert.notEqual(getNoteDocuments(), notesBefore, "derived notes are rebuilt");
  assert.ok(getNoteDocuments().find((d) => d.note.id === "tools-technologies")?.haystack.includes("swift"));
});

test("a rename keeps the Finder file id and Spotlight result id; only the name changes", async () => {
  answer(ok([repo(601, "before", { topics: ["react"] })]));
  await useRepositoryStore.getState().load();
  const id = "project:github:601@web-development";
  assert.equal(fs.getFile(id)?.name, "before");
  assert.ok(getSearchIndex().find((i) => i.id === "project:github:601")?.title === "before");

  answer(ok([repo(601, "after", { fullName: "octocat/after", topics: ["react"] })]));
  await useRepositoryStore.getState().refresh();
  assert.equal(fs.getFile(id)?.name, "after");
  assert.equal(fs.getFile(id)?.projectId, "github:601");
  assert.equal(getSearchIndex().filter((i) => i.id === "project:github:601").length, 1);
  assert.equal(getSearchIndex().find((i) => i.id === "project:github:601")?.title, "after");
});

test("a repository that is no longer returned in a complete fetch is removed everywhere", async () => {
  answer(ok([repo(701, "gone-soon", { topics: ["react"] })]));
  await useRepositoryStore.getState().load();
  assert.ok(fs.getFile("project:github:701@web-development"));
  answer(ok([]));
  await useRepositoryStore.getState().refresh();
  assert.equal(fs.getFile("project:github:701@web-development"), undefined);
  assert.ok(!getSearchIndex().some((i) => i.id === "project:github:701"));
});

test("a published resume is one document record, found by Finder, Spotlight and Terminal's file system; an unpublished one is found nowhere", () => {
  const published = documents.find((d) => d.id === "resume");
  assert.ok(published);
  if (isPublished(published)) {
    assert.equal(fs.getFile("resume")?.documentId, "resume");
    assert.equal(fs.getFile("desktop:resume")?.documentId, "resume");
    const hits = searchItems(getSearchIndex(), "cv").flatMap((g) => g.items);
    assert.ok(hits.some((i) => i.target.kind === "file" && i.target.fileId === "resume"));
  } else {
    // No approved public PDF yet: nobody is led to a file that does not exist.
    assert.equal(fs.getFile("resume"), undefined);
    assert.equal(fs.getFile("desktop:resume"), undefined);
    assert.equal(searchItems(getSearchIndex(), "resume").flatMap((g) => g.items).some((i) => i.type === "file"), false);
  }
});

test("a document marked published has its file under public/ (so enabling it cannot create a broken link)", () => {
  for (const d of documents.filter(isPublished)) assert.ok(existsSync(path.join(process.cwd(), "public", d.src)), `${d.src} is published but missing`);
});

test("search index ids are unique, with one result per project", () => {
  const ids = getSearchIndex().map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});
