/**
 * Weather from Open-Meteo (https://open-meteo.com): a free public API that needs no key, so there is
 * nothing secret in the client. The city is typed by the visitor; no location permission is used.
 * Results are cached for a while and shared between requests, to stay well inside the API's limits.
 */
export interface WeatherReading {
  city: string;
  region?: string;
  temperature: number;
  code: number;
  isDay: boolean;
  high: number;
  low: number;
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TTL = 15 * 60_000;

const cache = new Map<string, { at: number; value: WeatherReading }>();
const inflight = new Map<string, Promise<WeatherReading>>();

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  return response.json();
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

async function load(city: string): Promise<WeatherReading> {
  const geo = (await getJson(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)) as {
    results?: { name?: string; admin1?: string; country?: string; latitude?: number; longitude?: number }[];
  };
  const place = geo.results?.[0];
  if (!place || num(place.latitude) === null || num(place.longitude) === null) throw new Error("City not found");

  const forecast = (await getJson(
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`,
  )) as {
    current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
    daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
  };
  const temperature = num(forecast.current?.temperature_2m);
  const code = num(forecast.current?.weather_code);
  const high = num(forecast.daily?.temperature_2m_max?.[0]);
  const low = num(forecast.daily?.temperature_2m_min?.[0]);
  // Anything missing means the data can't be trusted, so nothing is shown rather than a guess.
  if (temperature === null || code === null || high === null || low === null) throw new Error("Incomplete weather data");
  return {
    city: place.name ?? city,
    region: place.country,
    temperature,
    code,
    isDay: forecast.current?.is_day !== 0,
    high,
    low,
  };
}

/** Weather for a city, cached for 15 minutes; simultaneous callers share one request. */
/** The request is shared and not abortable: one caller going away must not cancel it for another. */
export function fetchWeather(city: string, options: { force?: boolean } = {}): Promise<WeatherReading> {
  const key = city.trim().toLowerCase();
  const hit = cache.get(key);
  if (!options.force && hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.value);
  const pending = inflight.get(key);
  if (pending) return pending;
  const request = load(city.trim())
    .then((value) => {
      cache.set(key, { at: Date.now(), value });
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

/** WMO weather interpretation codes, as documented by Open-Meteo. */
export function describeWeather(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}
