// A small in-memory limiter. It protects a single running server instance and
// resets on restart. On serverless or multi-instance hosting each instance keeps
// its own counts, so for real protection put a shared store (e.g. Redis/KV) or
// the host's rate limiting in front of this. See .env.example.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const MIN_GAP_MS = 20 * 1000;
const MAX_TRACKED = 2000;

const hits = new Map<string, number[]>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  // Bound memory: forget the oldest keys if many distinct clients appear.
  if (hits.size > MAX_TRACKED) {
    for (const k of hits.keys()) {
      hits.delete(k);
      if (hits.size <= MAX_TRACKED / 2) break;
    }
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  const last = recent[recent.length - 1];
  if (last !== undefined && now - last < MIN_GAP_MS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((MIN_GAP_MS - (now - last)) / 1000) };
  }
  if (recent.length >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }
  hits.set(key, [...recent, now]);
  return { allowed: true };
}
