import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { getDocumentById, isPublished, isSafeDocumentPath } from "@/data/documents";
import { getAllMedia } from "@/data/media";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { profile } from "@/data/profile";
import { siteConfig } from "@/config/site";
import { deriveRegistry } from "@/lib/projects/registry";

test("the public résumé is published, present, and is a generated PDF, not the original CV", () => {
  const doc = getDocumentById("resume")!;
  assert.ok(isPublished(doc) && isSafeDocumentPath(doc.src));
  const file = join("public", doc.src);
  assert.ok(existsSync(file), "Resume.pdf is missing; run npm run resume");
  const bytes = readFileSync(file);
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  // The original CV carries a photo (hundreds of KB); the generated résumé is text only.
  assert.ok(statSync(file).size < 100_000, "the résumé is unexpectedly large: is it the original CV?");
  assert.ok(fs.getChildren("documents").some((f) => f.documentId === "resume"), "it appears in Documents");
  assert.equal(profile.resume?.documentId, "resume");
});

test("the name is Bertan Taşman everywhere it is configured", () => {
  assert.equal(siteConfig.owner.name, "Bertan Taşman");
  assert.equal(profile.displayName, "Bertan Taşman");
  assert.equal(profile.fullName, "Bertan Taşman");
  assert.equal(siteConfig.title, "Bertan Taşman’s macOS Portfolio");
  assert.equal(profile.email, "bertantasman@gmail.com");
});

test("every media file exists, has alt text and belongs to a real project", () => {
  const registry = deriveRegistry([]);
  const media = getAllMedia();
  assert.ok(media.length >= 24, "the CourtRise and LineMaster images are listed");
  for (const m of media) {
    assert.ok(existsSync(join("public", m.src)), `${m.src} is missing`);
    assert.ok(m.alt.length > 10 && m.title && m.description, `${m.id} lacks text`);
    assert.ok(m.projectId && registry.byId.has(m.projectId), `${m.id} has no project`);
    assert.ok(statSync(join("public", m.src)).size < 400_000, `${m.src} is too large for the web`);
  }
  assert.equal(media.filter((m) => m.projectId === "courtrise").length, 14);
  assert.equal(media.filter((m) => m.projectId === "linemaster").length, 10);
});
