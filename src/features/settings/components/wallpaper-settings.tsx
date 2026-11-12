"use client";

import Image from "next/image";
import { wallpapers, type Wallpaper } from "@/config/wallpapers";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsGroup } from "./settings-controls";

export function WallpaperSettings() {
  const current = useSettingsStore((s) => s.wallpaperId);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);

  return (
    <SettingsGroup title="Wallpaper">
      <div className="p-3.5">
        <div
          role="radiogroup"
          aria-label="Wallpaper"
          className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3"
        >
          {(wallpapers as readonly Wallpaper[]).map((w) => (
            <label key={w.id} className="flex cursor-pointer flex-col gap-1.5">
              <input
                type="radio"
                name="wallpaper"
                value={w.id}
                checked={current === w.id}
                onChange={() => setWallpaper(w.id)}
                className="peer sr-only"
              />
              <span className="relative block aspect-[16/10] overflow-hidden rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-transparent peer-checked:ring-(--accent) peer-focus-visible:ring-black/60">
                <Image
                  src={w.thumbnail ?? w.src}
                  alt=""
                  fill
                  sizes="160px"
                  quality={90}
                  draggable={false}
                  className="object-cover"
                />
              </span>
              <span className={`text-center text-[12px] ${current === w.id ? "font-semibold text-black/90" : "text-black/70"}`}>
                {w.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </SettingsGroup>
  );
}
