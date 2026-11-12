"use client";

import { useEffect, useState } from "react";
import type { ReadmeResponse } from "@/lib/github/types";

type State = { status: "loading" } | { status: "done"; result: ReadmeResponse };

const cache = new Map<string, ReadmeResponse>();
const inflight = new Map<string, Promise<ReadmeResponse>>();

async function load(fullName: string): Promise<ReadmeResponse> {
  const known = cache.get(fullName);
  if (known) return known;
  let pending = inflight.get(fullName);
  if (!pending) {
    pending = fetch(`/api/github/readme?repo=${encodeURIComponent(fullName)}`)
      .then((r) => r.json() as Promise<ReadmeResponse>)
      .catch((): ReadmeResponse => ({ ok: false, reason: "unavailable", message: "The README could not be loaded." }))
      .then((result) => {
        // Failures are retried on the next open; only answers (including "no README") are remembered.
        if (result.ok || result.reason === "no-readme") cache.set(fullName, result);
        return result;
      })
      .finally(() => inflight.delete(fullName));
    inflight.set(fullName, pending);
  }
  return pending;
}

/** The README for a repository, fetched when a project is opened (not for every repository up front) and then remembered. */
export function useReadme(fullName: string | undefined, attempt: number) {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    if (!fullName) return;
    let cancelled = false;
    // Starting a request is the one reason to set state from this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    void load(fullName).then((result) => !cancelled && setState({ status: "done", result }));
    return () => {
      cancelled = true;
    };
  }, [fullName, attempt]);
  return state;
}
