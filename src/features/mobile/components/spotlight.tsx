"use client";

import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { FileTypeIcon, ProjectIcon } from "@/components/file-icons";
import { useSpotlightSearch } from "@/features/spotlight/hooks/use-spotlight-search";
import type { SpotlightItem } from "@/features/spotlight/types/spotlight";
import { highlightParts, routeForItem, type MobileRoute } from "../lib/targets";
import { useMobileStore } from "../store/mobile-store";
import { OverlaySheet } from "./overlay-sheet";

function ResultIcon({ item }: { item: SpotlightItem }) {
  const icon = item.icon;
  if (icon.kind === "image") return <Image src={icon.src} alt="" width={64} height={64} unoptimized className="size-9 rounded-lg" />;
  if (icon.kind === "project") return <ProjectIcon className="size-9" />;
  return <FileTypeIcon file={icon.file} className="size-9" />;
}

/** Text with the matched terms in bold, built from parts (never from HTML), so a result title cannot inject markup. */
function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((p, i) => (p.match ? <strong key={i} className="font-bold text-white">{p.text}</strong> : <span key={i}>{p.text}</span>))}
    </>
  );
}

/** Search over the shared index (apps, projects, files, notes, profile), with every result opening a mobile app. */
export function MobileSpotlight() {
  const close = useMobileStore((s) => s.closeOverlay);
  const openApp = useMobileStore((s) => s.openApp);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const groups = useSpotlightSearch(deferred);
  const results = useMemo(
    () => groups.map((g) => ({ ...g, items: g.items.flatMap((item) => { const route = routeForItem(item); return route ? [{ item, route }] : []; }) })).filter((g) => g.items.length > 0),
    [groups],
  );
  const go = (route: MobileRoute) => {
    if (route.kind === "external") {
      window.open(route.url, "_blank", "noopener,noreferrer");
      close();
    } else openApp(route.app, route.stack);
  };
  return (
    <OverlaySheet label="Search" placement="full" className="bg-[#14122a]/85 backdrop-blur-2xl">
      <div className="flex items-center gap-2 p-3">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/12 px-3 focus-within:ring-2 focus-within:ring-white/90">
          <Search className="size-4 shrink-0 text-white/70" aria-hidden />
          <span className="sr-only">Search the portfolio</span>
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, apps, skills…"
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/55"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white/90">
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
        <button type="button" onClick={close} className="h-11 rounded-full px-3 text-[15px] text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/90">
          Cancel
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-6">
        {results.length === 0 && (
          <p role="status" className="px-3 py-10 text-center text-[14px] text-white/75">
            {query.trim() ? `No results for “${query.trim()}”. Try a project name, a skill or an app.` : "Type to search."}
          </p>
        )}
        {results.map((g) => (
          <section key={g.category} aria-label={g.label} className="mt-3">
            <h2 className="px-2 pb-1 text-[12px] font-semibold tracking-wide text-white/60 uppercase">{g.label}</h2>
            <ul className="overflow-hidden rounded-2xl bg-white/10">
              {g.items.map(({ item, route }) => (
                <li key={item.id} className="border-b border-white/10 last:border-b-0">
                  <button type="button" onClick={() => go(route)} className="flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-left outline-none focus-visible:bg-white/15 active:bg-white/15">
                    <ResultIcon item={item} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] text-white/90"><Highlight text={item.title} query={deferred} /></span>
                      {item.subtitle && <span className="block truncate text-[12px] text-white/60">{item.subtitle}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </OverlaySheet>
  );
}
