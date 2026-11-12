import { getProfile } from "@/lib/github/repositories";

/** The configured GitHub account's public profile. The shared cache lives in lib/github. */
export async function GET() {
  const result = await getProfile();
  const status = result.ok ? 200 : result.reason === "rate-limited" ? 429 : result.reason === "not-found" ? 404 : result.reason === "unavailable" ? 502 : 200;
  return Response.json(result, { status, headers: { "Cache-Control": result.ok ? "public, max-age=120, stale-while-revalidate=600" : "no-store" } });
}
