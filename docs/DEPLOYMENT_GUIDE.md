# Deployment guide

Nothing has been deployed. No account, domain, repository or paid service has been created. This guide describes how to do it once the developer approves.

## Recommendation: Vercel (Hobby plan)

The application is a Next.js 16 app with four server route handlers (`/api/contact`, `/api/github/*`) and server-side caching. That needs a host that runs Next.js server code, so a purely static export (GitHub Pages and similar) will not work: the GitHub data and the contact form would stop functioning.

Vercel is the simplest fit: it is built for Next.js, deploys from a git repository on every push, provides HTTPS and HSTS automatically, keeps environment variables server-side, and offers instant rollback. Its free Hobby plan covers a personal, non-commercial portfolio at this traffic level. Cost: none expected; confirm Vercel's current plan terms before relying on that.

Alternatives, if preferred: Netlify (via its Next.js runtime), Cloudflare (via OpenNext), or a self-hosted Node.js server running `npm run build && npm start` behind a reverse proxy that provides HTTPS. These need more setup and maintenance for no benefit here.

Caveat for any serverless host: the GitHub cache and the contact rate limit live in each server instance's memory. That is acceptable (cache misses only cost one GitHub request; the limiter still blocks bursts per instance), but a production `GITHUB_TOKEN` is recommended so shared outbound IP addresses cannot exhaust GitHub's anonymous limit of 60 requests per hour.

## Prerequisites

- Node.js 22.6 or newer (the project declares it in `package.json`; `npm test` relies on it).
- npm (the project uses `package-lock.json`).
- A git repository. **This project folder is not currently a git repository.** Create one and push it to a hosting account the developer chooses. Before the first commit, check that `.env.local` (if any) is not included: `.gitignore` already excludes `.env*` except `.env.example`.
- A decision on the resume (see the release checklist) and on the domain.

## Commands

| Purpose | Command |
| --- | --- |
| Install | `npm ci` |
| Develop | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Production build | `npm run build` |
| Production start (self-hosted) | `npm start` |
| Content audit | `npm run audit -- --github` |
| Statistics report | `npm run stats-report` |

## Environment variables

Set these in the hosting platform's settings, never in the repository. None may be prefixed with `NEXT_PUBLIC_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | No | Overrides the GitHub account. If empty, the GitHub URL in `src/config/site.ts` is used. |
| `GITHUB_TOKEN` | Recommended | A **fine-grained token with no permissions** (public data only) raises GitHub's rate limit. Server-only. |
| `CONTACT_RECIPIENT_EMAIL` | For the contact form | The only address that ever receives messages. |
| `EMAIL_FROM_ADDRESS` | For the contact form | A sender address on a domain verified with the email provider. |
| `RESEND_API_KEY` | For the contact form | Resend API key. All three contact variables are needed; otherwise the form reports that sending is unavailable and offers the visitor's own email app. |
| `SITE_URL` | After the domain is decided | The public origin, e.g. `https://example.com`. Sets the canonical URL and Open Graph base. Leave unset until then. |

The template is `.env.example` (placeholders only).

## Deployment steps (after approval)

1. Resolve the pre-launch items in `docs/PRODUCTION_RELEASE_CHECKLIST.md`, in particular the public resume decision.
2. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` locally; all must pass.
3. Create the git repository and push it.
4. Create the hosting project from that repository (framework preset: Next.js, no custom build settings needed).
5. Add the environment variables above.
6. Deploy to a preview URL first and run the verification steps below against it.
7. Only then attach the production domain (if any), set `SITE_URL`, and redeploy.

## Verification after deploying

- Open the site in a clean browser profile: lock screen, welcome, desktop, Contact widget.
- `curl -I https://<site>/` shows `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Frame-Options` and `Permissions-Policy`.
- `https://<site>/robots.txt` allows `/` and disallows `/api/`.
- View the page source: the title, description and Open Graph tags are present, and the summary text and `application/ld+json` block contain the developer's name and role, and nothing private.
- GitHub app lists the repositories; the browser's network panel shows one request each to `/api/github/repositories` and `/api/github/profile`.
- Send a test message through Mail (once the contact variables are set) and confirm it arrives. Until then confirm the form says direct sending is unavailable.
- Run Lighthouse or PageSpeed Insights on the live URL (this has not been measured by this project).

## Rollback

- Vercel keeps previous deployments: promote the last good deployment from the dashboard (instant, no rebuild).
- Otherwise revert the offending commit and push.
- Environment variable changes need a redeploy to take effect.
- If a secret is ever exposed, revoke it at the provider first, then replace it in the host settings.
