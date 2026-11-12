import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { siteConfig } from "@/config/site";
import { profile } from "@/data/profile";
import { getInstagramMedia } from "@/features/social/instagram/instagram-media";
import { getProfileLink } from "@/features/social/utils/social-links";
import { githubGet } from "@/lib/github/client";
import { normalizeProfile } from "@/lib/github/normalize";
import { getProfile, resetGitHubStateForTests } from "@/lib/github/repositories";
import type { PortfolioMedia } from "@/types/media";

const user = (extra: Record<string, unknown> = {}) => ({
  type: "User", login: "octocat", name: "The Octocat", bio: "Builds things", html_url: "https://github.com/octocat",
  avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4", public_repos: 8, followers: 9999, ...extra,
});

// ── Configured links ─────────────────────────────────────────────────────────────────────────

test("configured social links are valid https URLs on the right platform (or not set)", () => {
  const hosts = { github: "github.com", linkedin: "linkedin.com", instagram: "instagram.com" } as const;
  for (const [platform, host] of Object.entries(hosts)) {
    const url = siteConfig.profiles[platform as keyof typeof hosts];
    if (!url) continue;
    const u = new URL(url);
    assert.equal(u.protocol, "https:", platform);
    assert.ok(u.hostname === host || u.hostname === `www.${host}`, `${platform} points at ${u.hostname}`);
  }
});

test("the profile reads its social links from the one configuration, with no copies", () => {
  assert.equal(profile.socialLinks.github, siteConfig.profiles.github || undefined);
  assert.equal(profile.socialLinks.linkedin, siteConfig.profiles.linkedin || undefined);
  assert.equal(profile.socialLinks.instagram, siteConfig.profiles.instagram || undefined);
});

test("no component hardcodes a social profile URL: they all come from the configuration", () => {
  const walk = (dir: string, out: string[] = []): string[] => {
    for (const n of readdirSync(dir)) {
      const f = path.join(dir, n);
      if (statSync(f).isDirectory()) walk(f, out);
      else if (/\.(tsx?)$/.test(n)) out.push(f);
    }
    return out;
  };
  const urls = [siteConfig.profiles.github, siteConfig.profiles.linkedin, siteConfig.profiles.instagram].filter(Boolean);
  for (const f of walk(path.resolve(process.cwd(), "src")).filter((x) => !x.endsWith(path.join("config", "site.ts")))) {
    const text = readFileSync(f, "utf8");
    for (const url of urls) assert.ok(!text.includes(url), `${path.relative(process.cwd(), f)} repeats ${url}`);
  }
});

test("links with a wrong host or an unsafe scheme are rejected, and usernames are only read from the platform's own domain", () => {
  const original = { ...profile.socialLinks };
  try {
    (profile.socialLinks as Record<string, string>).github = "javascript:alert(1)";
    assert.equal(getProfileLink("github"), undefined);
    (profile.socialLinks as Record<string, string>).github = "https://example.com/octocat";
    assert.deepEqual(getProfileLink("github"), { url: "https://example.com/octocat" }, "valid URL, but no username is trusted");
    (profile.socialLinks as Record<string, string>).github = "https://github.com/octocat";
    assert.equal(getProfileLink("github")?.username, "octocat");
    (profile.socialLinks as Record<string, string>).linkedin = "https://www.linkedin.com/in/someone/";
    assert.equal(getProfileLink("linkedin")?.username, "someone");
  } finally {
    Object.assign(profile.socialLinks, original);
  }
});

test("an unconfigured platform yields no link, so nothing is claimed as connected", () => {
  const original = { ...profile.socialLinks };
  try {
    (profile.socialLinks as Record<string, string | undefined>).instagram = undefined;
    assert.equal(getProfileLink("instagram"), undefined);
  } finally {
    Object.assign(profile.socialLinks, original);
  }
});

// ── Instagram media ──────────────────────────────────────────────────────────────────────────

const image = (id: string, tags?: string[]): PortfolioMedia => ({ id, src: `/x/${id}.png`, title: id, alt: id, width: 10, height: 10, tags });

test("only photos tagged for Instagram appear in the Instagram app; screenshots and untagged images never do", () => {
  const media = [image("shot", ["screenshot"]), image("project-shot"), image("approved", ["travel", "instagram"])];
  assert.deepEqual(getInstagramMedia(media).map((m) => m.id), ["approved"]);
  assert.deepEqual(getInstagramMedia([]), []);
});

// ── GitHub profile ───────────────────────────────────────────────────────────────────────────

test("a valid GitHub user is reduced to the fields the portfolio shows, without follower counts", () => {
  const p = normalizeProfile(user());
  assert.deepEqual(p, { login: "octocat", name: "The Octocat", bio: "Builds things", avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4", htmlUrl: "https://github.com/octocat", publicRepos: 8 });
  assert.equal("followers" in (p as object), false);
});

test("profile data is validated: organisations, foreign links and oversized text are not accepted", () => {
  assert.equal(normalizeProfile(user({ type: "Organization" })), null);
  assert.equal(normalizeProfile(null), null);
  assert.equal(normalizeProfile(user({ html_url: "https://evil.example/octocat" })), null);
  assert.equal(normalizeProfile(user({ avatar_url: "https://evil.example/a.png" }))?.avatarUrl, null, "an avatar from another host is dropped");
  assert.equal(normalizeProfile(user({ avatar_url: "http://avatars.githubusercontent.com/u/1" }))?.avatarUrl, null, "plain http is dropped");
  assert.equal(normalizeProfile(user({ bio: "x".repeat(400) }))?.bio, null);
  assert.equal(normalizeProfile(user({ name: null, bio: "" }))?.name, null);
});

test("the GitHub client still only reaches the approved endpoints", async () => {
  await assert.rejects(() => githubGet("/users/octocat/followers"), /Blocked/);
  await assert.rejects(() => githubGet("/user"), /Blocked/);
  await assert.rejects(() => githubGet("/users/octocat/../../admin"), /Blocked/);
});

const realFetch = globalThis.fetch;
const realNow = Date.now;
let clock = 2_000_000_000_000;
let calls = 0;
beforeEach(() => {
  resetGitHubStateForTests();
  calls = 0;
  clock += 10 * 3_600_000;
  Date.now = () => clock;
  process.env.GITHUB_USERNAME = "octocat";
});
afterEach(() => {
  globalThis.fetch = realFetch;
  Date.now = realNow;
  delete process.env.GITHUB_USERNAME;
});
const answer = (status: number, body: unknown, headers: Record<string, string> = {}) => {
  globalThis.fetch = (async () => {
    calls++;
    return new Response(JSON.stringify(body), { status, headers });
  }) as typeof fetch;
};

test("the profile is fetched once, shared by simultaneous callers, and cached", async () => {
  answer(200, user());
  const [a, b] = await Promise.all([getProfile(), getProfile()]);
  assert.ok(a.ok && b.ok);
  await getProfile();
  assert.equal(calls, 1);
});

test("a failed refresh keeps the last good profile (marked stale); with none cached it is a clear failure", async () => {
  answer(500, {});
  const none = await getProfile();
  assert.equal(none.ok, false);
  resetGitHubStateForTests();
  answer(200, user());
  await getProfile();
  clock += 3_700_000;
  answer(500, {});
  const stale = await getProfile();
  assert.ok(stale.ok && stale.stale);
  assert.equal(stale.ok && stale.profile.login, "octocat");
});

test("an unknown user and a rate limit are distinct failures", async () => {
  answer(404, {});
  const missing = await getProfile();
  assert.equal(!missing.ok && missing.reason, "not-found");
  resetGitHubStateForTests();
  answer(403, {}, { "x-ratelimit-remaining": "0", "retry-after": "60" });
  const limited = await getProfile();
  assert.equal(!limited.ok && limited.reason, "rate-limited");
});
