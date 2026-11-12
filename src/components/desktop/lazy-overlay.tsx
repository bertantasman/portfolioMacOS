"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useOverlayStore } from "@/store/overlay-store";
import { overlayLoaders } from "./overlay-loaders";

type LazyName = keyof typeof overlayLoaders;

const components = Object.fromEntries(
  (Object.keys(overlayLoaders) as LazyName[]).map((name) => [name, dynamic(overlayLoaders[name], { loading: () => null })]),
) as Record<LazyName, React.ComponentType>;

/**
 * Mounts an overlay the first time it is opened and keeps it mounted afterwards, so its exit animation
 * and state behave exactly as before. Until then none of its code is in the page.
 */
export function LazyOverlay({ name }: { name: LazyName }) {
  const wanted = useOverlayStore((s) => s.active === name);
  const [opened, setOpened] = useState(false);
  if (wanted && !opened) setOpened(true);
  if (!opened) return null;
  const Overlay = components[name];
  return <Overlay />;
}
