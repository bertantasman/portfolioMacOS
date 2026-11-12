"use client";

import { useState } from "react";
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Moon } from "lucide-react";
import { useWidgetStore } from "@/store/widget-store";
import { useWeather } from "../hooks/use-weather";
import type { WidgetProps } from "../types/widgets";
import { describeWeather } from "../utils/weather";

function WeatherGlyph({ code, isDay, className }: { code: number; isDay: boolean; className?: string }) {
  if (code === 0) return isDay ? <Sun className={className} aria-hidden /> : <Moon className={className} aria-hidden />;
  if (code <= 2) return <CloudSun className={className} aria-hidden />;
  if (code === 3) return <Cloud className={className} aria-hidden />;
  if (code === 45 || code === 48) return <CloudFog className={className} aria-hidden />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} aria-hidden />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow className={className} aria-hidden />;
  if (code >= 95) return <CloudLightning className={className} aria-hidden />;
  return <Cloud className={className} aria-hidden />;
}

const degrees = (n: number) => `${Math.round(n)}°`;

/** Real weather for a city the visitor types. With no city, or when loading fails, it says so and shows no numbers. */
export function WeatherWidget({ size, preview }: WidgetProps) {
  const city = useWidgetStore((s) => s.prefs.weatherCity);
  const setCity = useWidgetStore((s) => s.setWeatherCity);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const { state, retry } = useWeather(city, !preview);
  const tab = preview ? -1 : 0;
  const link = "rounded-md px-1.5 py-0.5 text-[11px] text-(--accent) outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)";

  if (!city || editing) {
    return (
      <form
        data-no-drag
        className="flex size-full flex-col justify-center gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            setCity(draft);
            setEditing(false);
            setDraft("");
          }
        }}
      >
        <label htmlFor="weather-city" className="text-[12px] font-semibold text-black/80">
          Choose a city
        </label>
        <input
          id="weather-city"
          value={draft}
          tabIndex={tab}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Istanbul"
          maxLength={80}
          autoComplete="off"
          className="h-7 rounded-md border border-black/10 bg-black/[0.05] px-2 text-[12px] text-black/90 outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-(--accent)"
        />
        <div className="flex items-center gap-2">
          <button type="submit" tabIndex={tab} disabled={!draft.trim()} className="h-7 rounded-full bg-(--accent) px-3 text-[12px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40">
            Show weather
          </button>
          {city && (
            <button type="button" tabIndex={tab} onClick={() => setEditing(false)} className={link}>
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }

  if (state.status === "loading" || state.status === "idle") {
    return (
      <div role="status" className="grid size-full place-items-center p-4 text-center text-[12px] text-black/45">
        Loading weather for {city}…
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex size-full flex-col items-center justify-center gap-1.5 p-4 text-center">
        <span className="text-[13px] font-semibold text-black/80">{state.message}</span>
        <span className="text-[11px] text-black/50">{city}</span>
        <div className="flex gap-1">
          {state.message !== "City not found" && (
            <button type="button" tabIndex={tab} onClick={retry} className={link}>
              Retry
            </button>
          )}
          <button type="button" tabIndex={tab} onClick={() => setEditing(true)} className={link}>
            Change city
          </button>
        </div>
      </div>
    );
  }

  const w = state.data;
  const condition = describeWeather(w.code);
  if (size === "small") {
    return (
      <div className="flex size-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <button type="button" tabIndex={tab} onClick={() => setEditing(true)} aria-label={`${w.city}. Change city`} className="min-w-0 truncate rounded text-left text-[13px] font-semibold text-black/85 outline-none hover:text-(--accent) focus-visible:ring-2 focus-visible:ring-(--accent)">{w.city}</button>
          <WeatherGlyph code={w.code} isDay={w.isDay} className="size-5 shrink-0 text-(--accent)" />
        </div>
        <div>
          <span className="block text-[40px] leading-none font-light text-black/90">{degrees(w.temperature)}</span>
          <span className="text-[11px] text-black/55">{condition}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex size-full items-center justify-between gap-3 px-5">
      <div className="min-w-0">
        <span className="block truncate text-[14px] font-semibold text-black/85">
          {w.city}
          {w.region ? `, ${w.region}` : ""}
        </span>
        <span className="block text-[46px] leading-none font-light text-black/90">{degrees(w.temperature)}</span>
        <span className="text-[12px] text-black/55">
          {condition} · H {degrees(w.high)} L {degrees(w.low)}
        </span>
        <button type="button" tabIndex={tab} onClick={() => setEditing(true)} className={`${link} -ml-1.5 mt-1 block`}>
          Change city
        </button>
      </div>
      <WeatherGlyph code={w.code} isDay={w.isDay} className="size-12 shrink-0 text-(--accent)" />
    </div>
  );
}
