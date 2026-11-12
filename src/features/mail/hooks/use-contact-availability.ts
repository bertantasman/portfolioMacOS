"use client";

import { useEffect, useState } from "react";

export type ContactAvailability = "checking" | "available" | "unavailable";

/** Asks the server whether direct sending is configured. The server never reveals the recipient or credentials. */
export function useContactAvailability(): ContactAvailability {
  const [state, setState] = useState<ContactAvailability>("checking");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact", { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json() as Promise<{ available?: boolean }>)
      .then((data) => setState(data.available === true ? "available" : "unavailable"))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setState("unavailable");
      });
    return () => controller.abort();
  }, []);
  return state;
}
