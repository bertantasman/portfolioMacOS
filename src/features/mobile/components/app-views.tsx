"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { MobileAppId } from "../lib/apps";

const Loading = () => <div role="status" className="grid flex-1 place-items-center bg-surface text-[14px] text-black/50">Loading…</div>;
const load = (loader: () => Promise<{ default: ComponentType }>) => dynamic(loader, { ssr: false, loading: Loading });

// Each app is its own chunk and is only downloaded when it is opened.
const views: Record<MobileAppId, ComponentType> = {
  projects: load(() => import("../apps/projects-app")),
  about: load(() => import("../apps/about-app")),
  resume: load(() => import("../apps/resume-app")),
  contact: load(() => import("../apps/contact-app")),
  safari: load(() => import("../apps/safari-app")),
  files: load(() => import("../apps/files-app")),
  notes: load(() => import("../apps/notes-app")),
  photos: load(() => import("../apps/photos-app")),
  settings: load(() => import("../apps/settings-app")),
};

export function AppView({ app }: { app: MobileAppId }) {
  const View = views[app];
  return <View />;
}
