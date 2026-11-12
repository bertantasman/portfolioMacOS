import assert from "node:assert/strict";
import test from "node:test";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { profile } from "@/data/profile";
import { notes } from "@/data/notes";
import { getOpenKind, getOpenHandlers } from "@/lib/navigation";

const files = (folderId: string) => fs.getChildren(folderId);

test("every Experience, Education and Skills file has text, a description and a note to open", () => {
  for (const folderId of ["experience", "education", "skills"]) {
    const children = files(folderId);
    assert.ok(children.length > 0, `${folderId} is empty`);
    for (const f of children) {
      assert.equal(f.extension, "md");
      assert.ok(f.textContent && f.textContent.split("\n").length >= 2, `${f.name} has no text`);
      assert.ok(f.description, `${f.name} has no description`);
      assert.ok(notes.some((n) => n.id === f.noteId), `${f.name} points at an unknown note`);
      assert.equal(getOpenKind(f), "note");
      assert.ok(getOpenHandlers(f).some((a) => a.id === "notes"), "Notes handles it");
    }
  }
});

test("the text comes from the profile and adds nothing to it", () => {
  const ex = files("experience").find((f) => f.name === "Akıllı Otomat")!;
  assert.match(ex.textContent!, /Mobile Application Developer \/ Software Project Coordinator — Akıllı Otomat/);
  assert.match(ex.textContent!, /October 2025 – Present/);
  assert.match(ex.textContent!, /- Coordinates between technical and non-technical teams during software projects/);
  const intern = files("experience").find((f) => f.name === "BilgeAdam Teknoloji")!;
  assert.match(intern.textContent!, /Technologies: Swift, UIKit/);
  const edu = files("education").find((f) => /Ca' Foscari/.test(f.name))!;
    assert.match(edu.textContent!, /- System Security and Cryptography/);
  const skills = files("skills").find((f) => f.name === "Programming Languages")!;
  assert.equal(skills.textContent, "Programming Languages:\n  Swift, Java, Python");
  assert.equal(files("experience").length, profile.experience.length);
  assert.equal(files("education").length, profile.education.length);
  assert.equal(files("skills").length, profile.skillGroups.length);
});

test("no private CV detail reaches these files", () => {
  const all = ["experience", "education", "skills"].flatMap((id) => files(id)).map((f) => f.textContent).join("\n");
  assert.doesNotMatch(all, /\+\d[\d \t().-]{8,}\d|\b(born|birth|nationality|passport)\b/i);
});
