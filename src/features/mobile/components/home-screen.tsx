"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ProjectIcon } from "@/components/file-icons";
import { profile } from "@/data/profile";
import { categoryName, selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import { DOCK_APPS, HOME_APPS, getExternalApps, getMobileApp, mobileApps, type AppCategory } from "../lib/apps";
import { useMobileStore } from "../store/mobile-store";
import { AppIcon } from "./app-icon";
import { useDragScroll } from "./use-drag-scroll";
import { useSwipe } from "./use-swipe";

const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/** Page one: who this is, a Start Here card with the featured projects, the main apps and the Dock. */
function HomePage() {
  const openApp = useMobileStore((s) => s.openApp);
  const openOverlay = useMobileStore((s) => s.openOverlay);
  // Pull down on the name to search. Only this strip captures the gesture, so the page itself still scrolls on small phones.
  const pull = useSwipe((d) => d === "down" && openOverlay("spotlight"), 50);
  const registry = useProjectRegistry();
  const featured = selectFeatured(registry, 3).projects;
  const name = (profile.fullName ?? profile.displayName)?.trim();
  return (
    <div className="[mask-image:linear-gradient(to_bottom,transparent_0,black_calc(env(safe-area-inset-top)+36px),black)] flex h-full w-full shrink-0 snap-center flex-col gap-3.5 [@media(max-height:700px)]:gap-2.5 overflow-y-auto overscroll-contain px-5 pt-[calc(env(safe-area-inset-top)+46px)] [@media(max-height:700px)]:pt-[calc(env(safe-area-inset-top)+40px)] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <header {...pull.handlers} className="touch-none">
        <h1 className="text-[24px] leading-7 font-bold tracking-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">{name}</h1>
        {profile.headline && <p className="text-[14px] text-white/85 [@media(max-height:700px)]:hidden">{profile.headline}</p>}
      </header>
      <section aria-labelledby="start-here" className="rounded-[26px] border border-white/20 bg-black/25 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl [@media(max-height:700px)]:p-2.5">
        <h2 id="start-here" className="px-1.5 text-[11px] font-semibold tracking-wide text-white/70 uppercase">Start here</h2>
        <ul className="mt-2 space-y-1">
          {featured.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => openApp("projects", [p.id])} className="flex min-h-[46px] [@media(max-height:700px)]:min-h-[38px] w-full items-center gap-3 rounded-xl px-1.5 text-left outline-none transition-colors active:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/90">
                <ProjectIcon className="size-8 shrink-0" category={p.categories[0]} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-white">{p.title}</span>
                  <span className="block truncate text-[12px] text-white/70 [@media(max-height:700px)]:hidden">{p.categories.map(categoryName)[0]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => openApp("projects")} className="mt-1.5 h-11 [@media(max-height:700px)]:h-10 w-full rounded-full bg-white/90 text-[15px] font-semibold text-black outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
          Explore Projects
        </button>
      </section>
      <nav aria-label="Apps" className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-2.5 [@media(max-height:700px)]:gap-y-0.5">
        {HOME_APPS.map((id) => {
          const app = getMobileApp(id)!;
          return <AppIcon key={id} name={app.name} icon={app.icon} onOpen={() => openApp(id)} />;
        })}
      </nav>
    </div>
  );
}

/** Page two: every app, grouped, with a search box. Social apps open the real profile in a new tab. */
function AppLibrary() {
  const openApp = useMobileStore((s) => s.openApp);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const entries = [
      ...mobileApps.map((a) => ({ key: a.id, name: a.name, icon: a.icon, category: a.category as AppCategory, keywords: a.keywords, run: () => openApp(a.id), external: false })),
      ...getExternalApps().map((a) => ({ key: `ext:${a.id}`, name: a.name, icon: a.icon, category: a.category as AppCategory, keywords: [] as readonly string[], run: () => open(a.url), external: true })),
    ].filter((e) => !q || e.name.toLowerCase().includes(q) || e.keywords.some((k) => k.includes(q)));
    return (["Portfolio", "Work", "Tools", "Social"] as const).map((c) => ({ category: c, items: entries.filter((e) => e.category === c) })).filter((g) => g.items.length > 0);
  }, [q, openApp]);
  return (
    <div className="h-full w-full shrink-0 snap-center overflow-y-auto overscroll-contain px-5 pt-[calc(env(safe-area-inset-top)+46px)] pb-6 [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent_0,black_calc(env(safe-area-inset-top)+40px),black_calc(100%-28px),transparent)] [&::-webkit-scrollbar]:hidden">
      <h2 className="text-[22px] font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">App Library</h2>
      <label className="mt-3 flex h-11 items-center gap-2 rounded-xl bg-white/20 px-3 backdrop-blur-xl focus-within:ring-2 focus-within:ring-white/90">
        <Search className="size-4 text-white/80" aria-hidden />
        <span className="sr-only">Search apps</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps" className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/65" />
      </label>
      {groups.length === 0 && <p role="status" className="mt-6 text-center text-[14px] text-white/80">No apps match “{query}”.</p>}
      {groups.map((g) => (
        <section key={g.category} aria-label={g.category} className="mt-5">
          <h3 className="mb-2 text-[12px] font-semibold tracking-wide text-white/70 uppercase">{g.category}</h3>
          <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-3 rounded-3xl bg-black/20 p-3 backdrop-blur-xl">
            {g.items.map((e) => <AppIcon key={e.key} name={e.name} icon={e.icon} onOpen={e.run} external={e.external} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Two swipeable pages (Home and App Library) with page dots, a search pill for Spotlight and the Dock. */
export function HomeScreen() {
  const openApp = useMobileStore((s) => s.openApp);
  const openOverlay = useMobileStore((s) => s.openOverlay);
  const homePage = useMobileStore((s) => s.homePage);
  const setHomePage = useMobileStore((s) => s.setHomePage);
  const scroller = useRef<HTMLDivElement>(null);
  useDragScroll(scroller);

  // Dots and swipes stay in step: the dots scroll the pages, and scrolling updates the dots.
  useEffect(() => {
    const el = scroller.current;
    if (el && Math.round(el.scrollLeft / el.clientWidth) !== homePage) el.scrollTo({ left: homePage * el.clientWidth });
  }, [homePage]);

  return (
    <section aria-label="Home screen" className="absolute inset-0 flex flex-col">
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          const page = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)) as 0 | 1;
          if (page !== homePage) setHomePage(page);
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [scrollbar-width:none] [touch-action:pan-x_pan-y] [&::-webkit-scrollbar]:hidden"
      >
        <HomePage />
        <AppLibrary />
      </div>
      <div className="flex flex-col items-center gap-2 [@media(max-height:700px)]:gap-1 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div role="group" aria-label="Page" className="flex gap-1">
          {(["Home", "App Library"] as const).map((label, i) => (
            <button key={label} type="button" aria-label={`${label} page`} aria-current={homePage === i} onClick={() => setHomePage(i as 0 | 1)} className="grid size-6 [@media(max-height:700px)]:size-5 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/90">
              <span className={`size-2 rounded-full ${homePage === i ? "bg-white" : "bg-white/40"}`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => openOverlay("spotlight")} className="flex h-9 [@media(max-height:700px)]:h-8 items-center gap-1.5 rounded-full bg-black/25 px-4 text-[13px] text-white/90 backdrop-blur-xl outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/90 active:scale-95">
          <Search className="size-4" aria-hidden />
          Search
        </button>
        <nav aria-label="Dock" className="flex w-full max-w-[420px] justify-around rounded-[30px] border border-white/25 bg-white/20 px-2 py-2 [@media(max-height:700px)]:py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          {DOCK_APPS.map((id) => {
            const app = getMobileApp(id)!;
            return <AppIcon key={id} name={app.name} icon={app.icon} hideLabel compact onOpen={() => openApp(id)} />;
          })}
        </nav>
      </div>
    </section>
  );
}
