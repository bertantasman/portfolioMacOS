"use client";

import { useSyncExternalStore } from "react";
import { getDocumentById, isPublished, type PortfolioDocument } from "@/data/documents";
import { profile } from "@/data/profile";

/** The configured resume document, or undefined when none is configured. */
export function getResumeDocument(): PortfolioDocument | undefined {
  const doc = profile.resume ? getDocumentById(profile.resume.documentId) : undefined;
  return doc && isPublished(doc) ? doc : undefined;
}

type Availability = "unknown" | "present" | "missing";

const cache = new Map<string, Availability>();
const listeners = new Set<() => void>();
const pending = new Set<string>();

function probe(src: string) {
  if (pending.has(src) || cache.has(src)) return;
  pending.add(src);
  fetch(src, { method: "HEAD" })
    .then((res) => cache.set(src, res.ok && (res.headers.get("content-type") ?? "").includes("pdf") ? "present" : "missing"))
    .catch(() => cache.set(src, "missing"))
    .finally(() => {
      pending.delete(src);
      listeners.forEach((l) => l());
    });
}

/**
 * Whether the real file exists. Checked once per page load with a HEAD request, so download and
 * view actions only appear for a file that can actually be opened.
 */
export function useDocumentAvailability(src: string | undefined): Availability {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      if (src) probe(src);
      return () => listeners.delete(listener);
    },
    () => (src ? (cache.get(src) ?? "unknown") : "missing"),
    () => "unknown",
  );
}
