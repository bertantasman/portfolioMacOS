import assert from "node:assert/strict";
import { test } from "node:test";
import { reconcileRepositories } from "@/lib/github/reconcile";
import { repo } from "./fixtures";

const previous = [repo(1, "alpha"), repo(2, "beta"), repo(3, "gamma")];

test("a complete fetch is authoritative: missing repositories are removed", () => {
  const next = [repo(1, "alpha"), repo(4, "delta")];
  assert.deepEqual(reconcileRepositories(previous, next, { complete: true }).map((r) => r.id), [1, 4]);
});

test("a truncated fetch never removes anything", () => {
  const next = [repo(1, "alpha")];
  assert.deepEqual(reconcileRepositories(previous, next, { complete: false }).map((r) => r.id).sort(), [1, 2, 3]);
});

test("a renamed repository keeps its id and takes the new name, even from a partial fetch", () => {
  const merged = reconcileRepositories(previous, [repo(2, "beta-renamed")], { complete: false });
  const renamed = merged.filter((r) => r.id === 2);
  assert.equal(renamed.length, 1);
  assert.equal(renamed[0].name, "beta-renamed");
});
