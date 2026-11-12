import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeRepository } from "@/lib/github/normalize";
import { apiRepo } from "./fixtures";

test("a valid API item becomes a repository with the numeric id as identity", () => {
  const r = normalizeRepository(apiRepo(42, "demo", { stargazers_count: 7, topics: ["ios"] }));
  assert.equal(r?.id, 42);
  assert.equal(r?.fullName, "octocat/demo");
  assert.equal(r?.stars, 7);
  assert.deepEqual(r?.topics, ["ios"]);
});

test("items missing the essentials are dropped, not repaired", () => {
  assert.equal(normalizeRepository(null), null);
  assert.equal(normalizeRepository("x"), null);
  assert.equal(normalizeRepository({ ...apiRepo(1, "a"), id: "1" }), null);
  assert.equal(normalizeRepository({ ...apiRepo(1, "a"), name: "" }), null);
  assert.equal(normalizeRepository({ ...apiRepo(1, "a"), created_at: "not a date" }), null);
});

test("repository links must stay on github.com", () => {
  assert.equal(normalizeRepository(apiRepo(1, "a", { html_url: "https://evil.example/octocat/a" })), null);
  assert.equal(normalizeRepository(apiRepo(1, "a", { html_url: "javascript:alert(1)" })), null);
});

test("odd values are clamped or ignored", () => {
  const r = normalizeRepository(apiRepo(1, "a", { stargazers_count: -5, forks_count: "many", topics: ["ok", 3, ""], homepage: "javascript:alert(1)" }));
  assert.equal(r?.stars, 0);
  assert.equal(r?.forks, 0);
  assert.deepEqual(r?.topics, ["ok"]);
  assert.equal(r?.homepageUrl, null);
});
