"use client";

import { useMobileStore } from "../store/mobile-store";

const EMPTY: readonly string[] = [];

/** The detail screens currently open in an app (empty means its root screen). */
export function useStack(app: string): readonly string[] {
  return useMobileStore((s) => s.nav.stacks[app] ?? EMPTY);
}
