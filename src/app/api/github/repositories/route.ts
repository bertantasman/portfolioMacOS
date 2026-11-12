import { getRepositories } from "@/lib/github/repositories";

/** Public repositories of the configured GitHub account. Dynamic: the shared cache lives in lib/github. */
export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  const result = await getRepositories({ force });
  const status = result.ok ? 200 : result.reason === "rate-limited" ? 429 : result.reason === "not-found" ? 404 : result.reason === "unavailable" ? 502 : 200;
  return Response.json(result, {
    status,
    // Browsers and CDNs may reuse a good answer for a few minutes; failures are never cached.
    headers: { "Cache-Control": result.ok ? "public, max-age=120, stale-while-revalidate=600" : "no-store" },
  });
}
