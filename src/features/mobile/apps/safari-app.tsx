"use client";

import { ExternalLink, Lock } from "lucide-react";
import Image from "next/image";
import { ProjectIcon } from "@/components/file-icons";
import { categoryName, selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import { AppScreen } from "../components/app-screen";
import { getExternalApps, getMobileApp } from "../lib/apps";
import { useMobileStore } from "../store/mobile-store";

const FAVOURITES = ["projects", "about", "resume", "contact"] as const;

/**
 * A browser-style start page for this portfolio: the internal pages, the featured projects and the verified profiles.
 * It does not load arbitrary sites (many refuse to be embedded); external links open in a new tab.
 */
export default function SafariApp() {
  const openApp = useMobileStore((s) => s.openApp);
  const registry = useProjectRegistry();
  const featured = selectFeatured(registry, 4).projects;
  const external = getExternalApps();
  return (
    <AppScreen title="Safari">
      <div className="mb-5 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-black/[0.07] text-[14px] text-black/65" role="note" aria-label="Address: portfolio start page">
        <Lock className="size-3.5" aria-hidden />
        Portfolio · Start Page
      </div>
      <section aria-labelledby="fav">
        <h2 id="fav" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Favourites</h2>
        <ul className="grid grid-cols-4 gap-2">
          {FAVOURITES.map((id) => {
            const app = getMobileApp(id)!;
            return (
              <li key={id}>
                <button type="button" onClick={() => openApp(id)} className="flex min-h-[44px] w-full flex-col items-center gap-1.5 rounded-xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) active:bg-black/[0.05]">
                  <Image src={app.icon} alt="" width={96} height={96} unoptimized className="size-12 rounded-xl" />
                  <span className="text-[12px] text-black/80">{app.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-labelledby="feat" className="mt-6">
        <h2 id="feat" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Featured projects</h2>
        <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-surface-2">
          {featured.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => openApp("projects", [p.id])} className="flex min-h-[56px] w-full items-center gap-3 px-3 text-left outline-none focus-visible:bg-black/[0.05] active:bg-black/[0.05]">
                <ProjectIcon className="size-9 shrink-0" category={p.categories[0]} />
                <span className="min-w-0"><span className="block truncate text-[15px] font-medium text-black/90">{p.title}</span><span className="block truncate text-[12px] text-black/55">{p.categories.map(categoryName)[0]}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      {external.length > 0 && (
        <section aria-labelledby="else" className="mt-6">
          <h2 id="else" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Elsewhere</h2>
          <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-surface-2">
            {external.map((e) => (
              <li key={e.id}>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex min-h-[56px] items-center gap-3 px-4 text-[15px] text-black/90 outline-none focus-visible:bg-black/[0.05] active:bg-black/[0.05]">
                  <Image src={e.icon} alt="" width={96} height={96} unoptimized className="size-9 shrink-0 rounded-[9px]" />
                  <span className="min-w-0 flex-1">{e.name}<span className="sr-only"> (opens in a new tab)</span></span>
                  <ExternalLink className="size-4 shrink-0 text-black/45" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppScreen>
  );
}
