import { getReadme } from "@/lib/github/repositories";

const FULL_NAME = /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/;

export async function GET(request: Request) {
  const repo = new URL(request.url).searchParams.get("repo") ?? "";
  if (!FULL_NAME.test(repo)) return Response.json({ ok: false, reason: "not-found", message: "Unknown repository." }, { status: 400 });
  const result = await getReadme(repo);
  return Response.json(result, { headers: { "Cache-Control": result.ok ? "public, max-age=300" : "no-store" } });
}
