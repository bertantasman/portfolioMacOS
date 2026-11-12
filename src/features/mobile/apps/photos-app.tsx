"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllMedia, getMediaById } from "@/data/media";
import { getProjectById } from "@/lib/projects/registry";
import { AppScreen } from "../components/app-screen";
import { useMobileStore } from "../store/mobile-store";
import { useStack } from "./use-stack";

/** The approved screenshots and artwork from the shared media library, as a grid and a full-screen viewer with Previous and Next. */
export default function PhotosApp() {
  const stack = useStack("photos");
  const pushScreen = useMobileStore((s) => s.pushScreen);
  const openApp = useMobileStore((s) => s.openApp);
  const [project, setProject] = useState<string | null>(null);
  const all = getAllMedia();
  const projectIds = [...new Set(all.flatMap((m) => (m.projectId ? [m.projectId] : [])))];
  const shown = project ? all.filter((m) => m.projectId === project) : all;

  const id = stack[stack.length - 1];
  const current = id ? getMediaById(id) : undefined;
  if (id) {
    if (!current) {
      return (
        <AppScreen title="Photo" backLabel="Photos"><p role="status" className="py-10 text-center text-[14px] text-black/60">This photo isn’t available.</p></AppScreen>
      );
    }
    const index = all.findIndex((m) => m.id === current.id);
    const step = (d: number) => {
      const next = all[(index + d + all.length) % all.length];
      // Replace the viewer's screen instead of stacking one per photo, so Back returns to the grid in one step.
      useMobileStore.setState((s) => ({ nav: { ...s.nav, stacks: { ...s.nav.stacks, photos: [next.id] } } }));
    };
    const owner = current.projectId ? getProjectById(current.projectId) : undefined;
    return (
      <AppScreen title={`${index + 1} of ${all.length}`} backLabel="Photos" padded={false}>
        <figure className="flex min-h-full flex-col bg-black text-white">
          <div className="grid flex-1 place-items-center p-3">
            <Image src={current.src} alt={current.alt} width={current.width} height={current.height} sizes="100vw" priority className="max-h-[68dvh] w-auto max-w-full object-contain" />
          </div>
          <figcaption className="space-y-1 bg-black/80 px-4 py-3">
            <p className="text-[15px] font-semibold">{current.title}</p>
            {current.description && <p className="text-[13px] text-white/75">{current.description}</p>}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="grid size-11 place-items-center rounded-full bg-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white"><ChevronLeft className="size-5" aria-hidden /></button>
              {owner && <button type="button" onClick={() => openApp("projects", [owner.id])} className="h-11 rounded-full bg-white/15 px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-white">View {owner.title}</button>}
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="grid size-11 place-items-center rounded-full bg-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white"><ChevronRight className="size-5" aria-hidden /></button>
            </div>
          </figcaption>
        </figure>
      </AppScreen>
    );
  }
  return (
    <AppScreen title="Photos">
      <div role="group" aria-label="Filter by project" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[null, ...projectIds].map((p) => (
          <button key={p ?? "all"} type="button" aria-pressed={project === p} onClick={() => setProject(p)} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${project === p ? "bg-(--accent) text-(--accent-fg)" : "bg-black/[0.07] text-black/75"}`}>
            {p ? (getProjectById(p)?.title ?? p) : "All"}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p role="status" className="py-10 text-center text-[14px] text-black/60">No photos yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-1.5">
          {shown.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => pushScreen(m.id)} aria-label={m.alt} className="block aspect-square w-full overflow-hidden rounded-lg bg-black/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">
                <Image src={m.thumbnailSrc ?? m.src} alt="" width={m.width} height={m.height} sizes="33vw" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppScreen>
  );
}
