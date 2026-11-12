import type { NextRequest } from "next/server";
import { validateContact, type ContactResponse } from "@/lib/contact-schema";
import { getMailConfig, sendContactEmail } from "@/lib/server/email-provider";
import { checkRateLimit } from "@/lib/server/rate-limit";

const MAX_BODY_BYTES = 20_000;
// The only keys a request may contain. A recipient (or anything else) is rejected, never trusted.
const ALLOWED_KEYS = new Set(["name", "email", "subject", "message", "website"]);

const json = (body: ContactResponse, status: number, headers?: Record<string, string>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Reports only whether sending is configured; never the recipient or credentials. */
export async function GET() {
  return Response.json({ available: getMailConfig() !== null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const config = getMailConfig();
  if (!config) {
    return json({ success: false, message: "Direct sending isn't available right now." }, 503);
  }

  // Same-origin only: the contact form lives on this site.
  const origin = request.headers.get("origin");
  let originHost: string | null = null;
  try {
    originHost = origin ? new URL(origin).host : null;
  } catch {
    originHost = "invalid";
  }
  if (originHost && originHost !== request.headers.get("host")) {
    return json({ success: false, message: "Request not allowed." }, 403);
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return json({ success: false, message: "The message is too large." }, 413);

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const limit = checkRateLimit(forwarded || request.headers.get("x-real-ip") || "unknown");
  if (!limit.allowed) {
    return json(
      { success: false, message: "Too many messages. Please wait a little before trying again." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ success: false, message: "The message is too large." }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ success: false, message: "The request could not be read." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ success: false, message: "The request could not be read." }, 400);
  }
  const record = body as Record<string, unknown>;
  if (Object.keys(record).some((key) => !ALLOWED_KEYS.has(key))) {
    return json({ success: false, message: "The request could not be read." }, 400);
  }
  // Honeypot: real visitors never see or fill this field.
  if (typeof record.website === "string" && record.website.trim() !== "") {
    return json({ success: false, message: "The message could not be submitted." }, 400);
  }

  const validation = validateContact(record);
  if (!validation.ok) {
    return json({ success: false, message: "Please correct the highlighted fields.", errors: validation.errors }, 400);
  }

  const result = await sendContactEmail(config, validation.data);
  if (!result.ok) {
    return json({ success: false, message: "Your message could not be sent. Please try again later." }, 502);
  }
  return json({ success: true, message: "Your message has been submitted successfully." }, 200);
}
