"use client";

import { ChevronRight } from "lucide-react";
import { FileTypeIcon } from "@/components/file-icons";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { sortFiles } from "@/lib/virtual-fs/sort";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import { AppScreen } from "../components/app-screen";
import { routeForTarget } from "../lib/targets";
import { useMobileStore } from "../store/mobile-store";
import { useRepositoryStore } from "@/store/repository-store";
import { useStack } from "./use-stack";

/** Browses the portfolio's virtual folders (the same tree as Finder). Projects, the résumé, notes and photos open their mobile app. */
export default function FilesApp() {
  const stack = useStack("files");
  const pushScreen = useMobileStore((s) => s.pushScreen);
  const openApp = useMobileStore((s) => s.openApp);
  void useRepositoryStore((s) => s.repositories); // redraw when the GitHub repositories load
  const folderId = stack[stack.length - 1] ?? fs.rootId;
  const folder = fs.getFile(folderId)?.type === "folder" ? fs.getFile(folderId)! : fs.getFile(fs.rootId)!;
  const isRoot = folder.id === fs.rootId;
  let items = sortFiles(fs.getChildren(folder.id), { key: "name", foldersFirst: true });
  // At the top level, folders with nothing in them are not worth a tap.
  if (isRoot) items = items.filter((f) => f.type !== "folder" || fs.getChildren(f.id).length > 0);

  const open = (file: VirtualFile) => {
    if (file.type === "folder") return pushScreen(file.id);
    const route = routeForTarget({ kind: "file", fileId: file.id });
    if (route?.kind === "app") openApp(route.app, route.stack);
  };
  const path = fs.getBreadcrumbs(folder.id).slice(1).map((b) => b.name);
  return (
    <AppScreen title={isRoot ? "Files" : folder.name} backLabel={stack.length > 1 ? (fs.getFile(stack[stack.length - 2])?.name ?? "Back") : "Files"} padded={false}>
      <nav aria-label="Location" className="border-b border-black/10 px-4 py-2 text-[12px] text-black/50">
        {path.length === 0 ? "On My Portfolio" : path.join(" › ")}
      </nav>
      {items.length === 0 ? (
        <p role="status" className="py-12 text-center text-[14px] text-black/55">This folder is empty</p>
      ) : (
        <ul className="divide-y divide-black/10">
          {items.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => open(f)} className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left outline-none focus-visible:bg-black/[0.05] active:bg-black/[0.05]">
                <FileTypeIcon file={f} className="size-9 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[16px] text-black/90">{f.name}</span>
                {f.type === "folder" && <ChevronRight className="size-4 shrink-0 text-black/35" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppScreen>
  );
}
