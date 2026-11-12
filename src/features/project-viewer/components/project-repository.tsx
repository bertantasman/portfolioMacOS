"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useState } from "react";
import { GitFork, Star } from "lucide-react";
import { SafeMarkdown } from "@/lib/markdown/safe-markdown";
import type { GitHubRepository } from "@/lib/github/types";
import { useReadme } from "../hooks/use-readme";
import { Section } from "./section";

const dateFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { year: "numeric", month: "short", day: "numeric" });
const fmt = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : null);

/** Real repository facts. Nothing here is made up. */
export function ProjectRepository({ id, repository }: { id: string; repository: GitHubRepository }) {
  const rows = [
    { label: "Repository", value: repository.fullName },
    ...(repository.primaryLanguage ? [{ label: "Language", value: repository.primaryLanguage }] : []),
    { label: "Created", value: fmt(repository.createdAt)! },
    { label: "Last updated", value: fmt(repository.updatedAt)! },
    ...(repository.pushedAt ? [{ label: "Last push", value: fmt(repository.pushedAt)! }] : []),
    { label: "Default branch", value: repository.defaultBranch },
  ];
  const homepage = repository.homepageUrl;

  return (
      <Section title="Repository" id={id}>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-black/70">
          <span className="inline-flex items-center gap-1" aria-label={`${repository.stars} stars`}>
            <Star className="size-3.5" aria-hidden />
            {repository.stars}
          </span>
          <span className="inline-flex items-center gap-1" aria-label={`${repository.forks} forks`}>
            <GitFork className="size-3.5" aria-hidden />
            {repository.forks}
          </span>
          {repository.isFork && <span className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[11px]">Fork</span>}
          {repository.isArchived && <span className="rounded-md bg-[#febc2e]/25 px-2 py-0.5 text-[11px]">Archived</span>}
        </div>
        {repository.topics.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Topics">
            {repository.topics.map((t) => (
              <li key={t} className="rounded-full bg-(--accent)/10 px-2 py-0.5 text-[11px] text-(--accent)">
                {t}
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-3 divide-y divide-black/[0.08] rounded-lg border border-black/10 text-[12px]">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4 px-3 py-1.5">
              <dt className="text-black/50">{r.label}</dt>
              <dd className="text-right text-black/85">{r.value}</dd>
            </div>
          ))}
        </dl>
        {homepage && (
          <p className="mt-2 text-[12px] text-black/55">
            Homepage:{" "}
            <a href={homepage} target="_blank" rel="noopener noreferrer" className="text-(--link-color) hover:underline">
              {homepage.replace(/^https?:\/\//, "")}
            </a>
          </p>
        )}
      </Section>
  );
}

/** The README, fetched when this window opens and then remembered. */
export function ProjectReadme({ id, repository }: { id: string; repository: GitHubRepository }) {
  const [attempt, setAttempt] = useState(0);
  const readme = useReadme(repository.fullName, attempt);
  return (
      <Section title="README" id={id}>
        {readme.status === "loading" ? (
          <p role="status" className="text-[12px] text-black/45">
            Loading README…
          </p>
        ) : readme.result.ok ? (
          <>
            <SafeMarkdown source={readme.result.markdown} repo={repository} />
            {readme.result.truncated && <p className="mt-2 text-[11px] text-black/45">This README is long; only the first part is shown. See the full text on GitHub.</p>}
          </>
        ) : readme.result.reason === "no-readme" ? (
          <p className="text-[12px] text-black/50">This repository has no README.</p>
        ) : (
          <div role="alert" className="flex items-center gap-2 text-[12px] text-black/60">
            <span>{readme.result.message}</span>
            {readme.result.reason !== "rate-limited" && (
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="rounded-md px-1.5 py-0.5 text-(--accent) outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)">
                Retry
              </button>
            )}
          </div>
        )}
      </Section>
  );
}
