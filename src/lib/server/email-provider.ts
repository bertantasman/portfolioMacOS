import type { ContactInput } from "@/lib/contact-schema";
import { isValidEmail } from "@/lib/contact-schema";

/** Server-only configuration, read from environment variables at request time. */
export interface MailConfig {
  recipient: string;
  /** Verified sender address on the provider (never the visitor's address). */
  from: string;
  apiKey: string;
}

export function getMailConfig(): MailConfig | null {
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim() ?? "";
  const from = process.env.EMAIL_FROM_ADDRESS?.trim() ?? "";
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (!apiKey || !isValidEmail(recipient) || !isValidEmail(from)) return null;
  return { recipient, from, apiKey };
}

export type SendResult = { ok: true } | { ok: false; reason: "rejected" | "unreachable" };

/** Plain-text body. Plain text can't carry markup, so visitor content needs no HTML escaping. */
export function buildEmailText(input: ContactInput, submittedAt: Date): string {
  return [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Submitted: ${submittedAt.toISOString()}`,
    "",
    input.message,
    "",
    "—",
    "Sent through the portfolio contact form. Reply to this email to answer the visitor.",
  ].join("\n");
}

/**
 * Sends through Resend's REST API with a plain fetch (no SDK). Success means the
 * provider accepted the message, not that it was delivered or read.
 */
export async function sendContactEmail(config: MailConfig, input: ContactInput): Promise<SendResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [config.recipient], // always the configured recipient, never anything from the request
        reply_to: input.email,
        subject: `[Portfolio] ${input.subject}`,
        text: buildEmailText(input, new Date()),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      // Log the status only: never the body, the key, or the visitor's message.
      console.error(`[contact] email provider responded with HTTP ${response.status}`);
      return { ok: false, reason: "rejected" };
    }
    return { ok: true };
  } catch {
    console.error("[contact] email provider was unreachable");
    return { ok: false, reason: "unreachable" };
  } finally {
    clearTimeout(timeout);
  }
}
