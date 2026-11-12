"use client";

import { useEffect, useState } from "react";
import { fetchWeather, type WeatherReading } from "../utils/weather";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: WeatherReading }
  | { status: "error"; message: string };

/** Loads weather for `city` while the widget is mounted (and not in a preview). Never invents a value. */
export function useWeather(city: string | undefined, enabled: boolean) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!city || !enabled) return;
    const controller = new AbortController();
    // Starting a fetch is the one place state is set from an effect: it reflects an external request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    fetchWeather(city, { force: attempt > 0 })
      .then((data) => !controller.signal.aborted && setState({ status: "ready", data }))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: e instanceof Error && e.message === "City not found" ? "City not found" : "Weather unavailable" });
      });
    return () => controller.abort();
  }, [city, enabled, attempt]);

  return { state: city && enabled ? state : ({ status: "idle" } as State), retry: () => setAttempt((n) => n + 1) };
}
