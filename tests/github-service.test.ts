import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { siteConfig } from "@/config/site";
import { getRepositories, resetGitHubStateForTests } from "@/lib/github/repositories";
import { apiRepo } from "./fixtures";

type Handler = (url: URL) => Response | Promise<Response>;
const realFetch = globalThis.fetch;
const realNow = Date.now;
let clock = 1_000_000_000_000;
let calls: string[] = [];

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, ...init });
const useFetch = (handler: Handler) => {
  globalThis.fetch = (async (input: URL | string) => {
    const url = new URL(String(input));
    calls.push(url.pathname + url.search);
    return handler(url);
  }) as typeof fetch;
};
const HOUR = 61 * 60_000;

beforeEach(() => {
  resetGitHubStateForTests();
  calls = [];
  clock += 10 * HOUR;
  Date.now = () => clock;
  process.env.GITHUB_USERNAME = "octocat";
});
afterEach(() => {
  globalThis.fetch = realFetch;
  Date.now = realNow;
  delete process.env.GITHUB_USERNAME;
});

test("loads every page and normalizes the result", async () => {
  useFetch((url) =>
    url.searchParams.get("page") === "1"
      ? json([apiRepo(1, "a"), { junk: true }], { headers: { link: '<https://api.github.com/x?page=2>; rel="next"' } })
      : json([apiRepo(2, "b")]),
  );
  const result = await getRepositories();
  assert.ok(result.ok);
  assert.deepEqual(result.repositories.map((r) => r.id), [1, 2]);
  assert.equal(result.truncated, false);
});

test("a fresh result is served from cache without another request", async () => {
  useFetch(() => json([apiRepo(1, "a")]));
  await getRepositories();
  await getRepositories();
  assert.equal(calls.length, 1);
});

test("simultaneous refreshes share one set of requests", async () => {
  useFetch(() => json([apiRepo(1, "a")]));
  await Promise.all([getRepositories(), getRepositories(), getRepositories()]);
  assert.equal(calls.length, 1);
});

test("a new repository and a rename arrive on the next refresh under the same id", async () => {
  useFetch(() => json([apiRepo(1, "a")]));
  await getRepositories();
  clock += HOUR;
  useFetch(() => json([apiRepo(1, "a-renamed"), apiRepo(2, "brand-new")]));
  const result = await getRepositories();
  assert.ok(result.ok && !result.stale);
  assert.deepEqual(result.repositories.map((r) => [r.id, r.name]), [[1, "a-renamed"], [2, "brand-new"]]);
});

test("a failure on a later page is not a snapshot: the last good copy is kept and marked stale", async () => {
  useFetch(() => json([apiRepo(1, "a"), apiRepo(2, "b")]));
  await getRepositories();
  clock += HOUR;
  useFetch((url) =>
    url.searchParams.get("page") === "1"
      ? json([apiRepo(1, "a")], { headers: { link: '<https://api.github.com/x?page=2>; rel="next"' } })
      : new Response("boom", { status: 500 }),
  );
  const result = await getRepositories();
  assert.ok(result.ok);
  assert.equal(result.stale, true);
  assert.deepEqual(result.repositories.map((r) => r.id), [1, 2], "repository 2 must not be removed");
});

test("a rate limit keeps the cache and is remembered, so GitHub is not asked again early", async () => {
  useFetch(() => json([apiRepo(1, "a")]));
  await getRepositories();
  clock += HOUR;
  useFetch(() => new Response("{}", { status: 403, headers: { "x-ratelimit-remaining": "0", "retry-after": "120" } }));
  const first = await getRepositories();
  assert.ok(first.ok && first.stale);
  const callsAfter = calls.length;
  await getRepositories();
  assert.equal(calls.length, callsAfter, "no new request while rate limited");
});

test("a rate limit with nothing cached is reported as a failure", async () => {
  useFetch(() => new Response("{}", { status: 429, headers: { "retry-after": "30" } }));
  const result = await getRepositories();
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.reason, "rate-limited");
});

test("an unknown user and a network failure are distinct failures", async () => {
  useFetch(() => new Response("{}", { status: 404 }));
  const missing = await getRepositories();
  assert.equal(!missing.ok && missing.reason, "not-found");
  resetGitHubStateForTests();
  globalThis.fetch = (async () => {
    throw new TypeError("network down");
  }) as typeof fetch;
  const down = await getRepositories();
  assert.equal(!down.ok && down.reason, "unavailable");
});

test("invalid or missing usernames never reach GitHub", async () => {
  useFetch(() => json([]));
  process.env.GITHUB_USERNAME = "not valid!";
  const invalid = await getRepositories();
  assert.equal(!invalid.ok && invalid.reason, "invalid-username");
  assert.equal(calls.length, 0);
  // With no environment variable the account comes from the profile URL in siteConfig, if there is one.
  delete process.env.GITHUB_USERNAME;
  if (!siteConfig.profiles.github) {
    const none = await getRepositories();
    assert.equal(!none.ok && none.reason, "not-configured");
    assert.equal(calls.length, 0);
  }
});

test("a fetch stopped by the page limit is flagged and does not drop known repositories", async () => {
  useFetch(() => json([apiRepo(1, "a"), apiRepo(2, "b")]));
  await getRepositories();
  clock += HOUR;
  useFetch((url) => json([apiRepo(1, "a"), apiRepo(100 + Number(url.searchParams.get("page")), "p")], { headers: { link: '<https://api.github.com/x?page=99>; rel="next"' } }));
  const result = await getRepositories();
  assert.ok(result.ok);
  assert.equal(result.truncated, true);
  assert.ok(result.repositories.some((r) => r.id === 2), "repository 2 is kept");
});
